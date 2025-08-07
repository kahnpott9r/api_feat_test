import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import {
  AgreementPaymentInfo,
  AgreementsService,
} from 'src/agreements/agreements.service';
import {
  Agreement,
  PaymentMethod,
} from 'src/agreements/entities/agreement.entity';
import { Finance, PaymentStatus } from 'src/finance/entites/finance.entity';
import { FinanceService } from 'src/finance/finance.service';
import { Property } from 'src/properties/entities/property.entity';
import { Renter } from 'src/renters/entities/renters.entity';
import { Tenant, TENANT_TYPE } from 'src/tenants/entities/tenant.entity';
import { EmailService } from 'src/Utils/EmailService';
import { WebRequestService } from 'src/Utils/WebRequestService';
import { DataSource, Repository } from 'typeorm';
import { ExactOnlineService } from '../exact-online/exact-online.service';
import { ExactFinanceInterface } from '../exact-online/interfaces/exact.interface';
import { CreateOPP } from './dto/create-payment.dto';
import {
  BankStatus,
  ContactStatus,
  OppProvider,
} from './entities/opp_provider.entity';
import { MerchantWithContact } from './OPPResponse/Compliance';
import { ResponseCreateBank } from './OPPResponse/ResponseCreateBank';
import { ResponseCreateCustomerMerchant } from './OPPResponse/ResponseCreateCustomerMerchant';
import { ResponseCreateTransaction } from './OPPResponse/ResponseCreateTransaction';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly emailService: EmailService,
    private configService: ConfigService,
    private webRequestService: WebRequestService,
    private financeService: FinanceService,
    private exactOnlineService: ExactOnlineService,
    private agreementService: AgreementsService,
    private dataSource: DataSource,
    @InjectRepository(OppProvider)
    private OppProviderRepository: Repository<OppProvider>,
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    @InjectRepository(Finance) private financeRepository: Repository<Finance>,
  ) {}

  async processAllAgreements() {
    this.logger.warn('Running agreements job');
    const allAgreements = await this.agreementService.getConsumerAgreements();
    for (const agreement of allAgreements) {
      try {
        this.logger.warn('Agreement ID: ' + agreement.id);
        const primaryRenter = agreement.primaryRenter;
        const tenant = agreement.tenant;
        const property = agreement.property;
        await this.processPaymentForAgreement(
          tenant,
          primaryRenter,
          property,
          agreement,
        );
      } catch (e) {
        console.warn('Error processing agreement', e);
      }
    }
  }

  async create(tenantId: number, oppDTO: CreateOPP) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Klant bestaat niet');
    }
    delete oppDTO['tenantId'];
    let opp = await this.OppProviderRepository.findOne({
      where: {
        tenant: {
          id: tenant.id,
        },
      },
    });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!opp) {
        // const getMerchant = `${this.configService.get(
        //   'OPP_PAYMENT_URL',
        // )}/merchants?filter[emailaddress]=${dto.email}`;
        // const result = await this.webRequestService.sendGetRequest(getMerchant);
        // if (result?.data.length > 0) {
        //   /*A merchant with this email already exists*/
        // }
        const newOpp = this.OppProviderRepository.create({
          tenant,
          chamber_number: '',
          country: '',
          email: tenant.email,
          phone_number: oppDTO.phone_number,
          vat_number: '',
        });
        opp = await queryRunner.manager.save(newOpp);
        tenant.opp_payment = opp;
        await queryRunner.manager.save(tenant);
      }
      if (!opp.merchantId) {
        await this.createNewMerchant(opp, oppDTO, queryRunner, tenant);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
    return opp;
  }

  async getTenantOPP(tenant: number) {
    return await this.tenantRepository.findOne({
      where: {
        id: tenant,
      },
      relations: ['opp_payment'],
    });
  }

  async createNewMerchant(
    opp: OppProvider,
    dto: CreateOPP,
    queryRunner,
    tenant: Tenant,
  ) {
    const createConsumerMerchantUrl = `${this.configService.get(
      'OPP_PAYMENT_URL',
    )}/merchants`;
    const merchantData: ResponseCreateCustomerMerchant =
      await this.webRequestService.sendPostRequest(createConsumerMerchantUrl, {
        country: 'nld',
        emailaddress: tenant.email,
        locale: 'nl',
        phone: dto.phone_number,
        notify_url: this.configService.get('OPP_NOTIFY_URL'),
      });

    opp.merchantId = merchantData.uid;
    opp.merchantStatus = merchantData.status;
    opp.merchantType = merchantData.type;
    opp.complianceStatus = merchantData.compliance.status;
    opp.complianceLevel = merchantData.compliance.level;
    opp.complianceOverviewUrl = merchantData.compliance.overview_url;
    await queryRunner.manager.save(opp);

    const createBankUrl = `${this.configService.get(
      'OPP_PAYMENT_URL',
    )}/merchants/${merchantData.uid}/bank_accounts`;
    const bankData: ResponseCreateBank =
      await this.webRequestService.sendPostRequest(createBankUrl, {
        return_url: this.configService.get('OPP_RETURN_URL'),
        notify_url: this.configService.get('OPP_NOTIFY_URL'),
      });
    console.log('bankData', bankData);

    opp.bankId = bankData.uid;
    opp.bankVerifyUrl = bankData.verification_url;
    opp.bankStatus = bankData.status as BankStatus;

    const merchantDataWithContact: MerchantWithContact =
      await this.webRequestService.sendGetRequest(
        `${this.configService.get('OPP_PAYMENT_URL')}/merchants/${
          merchantData.uid
        }?expand[]=contacts`,
      );

    if (merchantDataWithContact.contacts.length > 0) {
      const contact = merchantDataWithContact.contacts[0];
      opp.contactId = contact.uid;
      opp.contactStatus = contact.status as ContactStatus;
      opp.contactVerifyUrl = contact.verification_url;
    }
    console.log('merchantDataWithContact', merchantDataWithContact);

    await queryRunner.manager.save(opp);
  }

  async processPaymentForAgreement(
    tenant: Tenant,
    renter: Renter,
    property: Property,
    agreement: Agreement,
  ) {
    /*Get the most recent finance, we need this to condtionality add the borg*/
    const hasRecentFinance = await this.financeService.getMostRecentFinancy(
      agreement.id,
      property.id,
    );

    /*Convert the agreement into an amount + logiticalitems*/
    const agreementPaymentInfo = this.agreementService.getAgreementPaymentInfo(
      agreement,
      !!hasRecentFinance,
    );
    this.logger.warn(`[${agreement.id}] After get Agreement`);
    /*Check if payment already has been send this month*/
    const financeEntryPastMonth =
      await this.financeService.isSentPaymentRequestInThisMonth(agreement.id);

    const allowedStatuses = [
      PaymentStatus.Manual,
      PaymentStatus.PlannedForSent,
      PaymentStatus.PaymentProviderNotReady,
      PaymentStatus.FailedToSent,
    ];

    if (
      financeEntryPastMonth &&
      !allowedStatuses.includes(financeEntryPastMonth.status)
    ) {
      this.logger.warn(
        `[${agreement.id}] finance found in past month and status is: ${financeEntryPastMonth.status}`,
      );
      return;
    }

    await this.startTranscation({
      tenant,
      renter,
      property,
      agreement,
      agreementPaymentInfo,
      existingFinanceEntry: financeEntryPastMonth || null,
    });
  }

  async startTranscation({
    tenant,
    renter,
    property,
    agreement,
    agreementPaymentInfo,
    existingFinanceEntry,
  }: {
    tenant: Tenant;
    renter: Renter;
    property: Property;
    agreement: Agreement;
    agreementPaymentInfo: AgreementPaymentInfo;
    existingFinanceEntry?: Finance;
  }): Promise<void> {
    let financyEntry;
    if (!existingFinanceEntry) {
      financyEntry = await this.financeService.createFinanceEntry(
        tenant.email,
        agreement.payment_method === PaymentMethod.Automatic
          ? PaymentStatus.PlannedForSent
          : PaymentStatus.ManualActionNeeded,
        tenant,
        renter,
        property,
        agreement,
        '',
        agreementPaymentInfo,
      );
    } else {
      financyEntry = existingFinanceEntry;
    }

    if (
      agreement.payment_method === PaymentMethod.Automatic &&
      tenant.type === TENANT_TYPE.CONSUMER
    ) {
      this.logger.warn('OPP called');
      /*Get the OPP Payment*/
      const OppProvider = await this.OppProviderRepository.findOne({
        where: {
          tenant: {
            id: tenant.id,
          },
        },
      });
      if (!OppProvider || OppProvider?.complianceLevel < 100) {
        this.logger.warn(`[${agreement.id}] OPP is not ready.`);
        await this.financeService.updateFinanceStatus(
          financyEntry,
          PaymentStatus.PaymentProviderNotReady,
        );
        return;
      }
      this.logger.warn(
        `[${agreement.id}] has a payment set up, so we are sending..`,
      );

      if (!this.checkIfPaymentIsToday(agreement)) return;
      const { sent, status, oppId, oppUrl } = await this.sendOppProviderRequest(
        OppProvider,
        renter,
        financyEntry,
        agreement,
        property,
        tenant,
      );

      this.logger.warn(`[${agreement.id}] sent: ${sent} and status: ${status}`);
      await this.financeService.updateFinanceStatus(
        financyEntry,
        status,
        null,
        { id: oppId, url: oppUrl },
      );
    } else if (
      agreement.payment_method === PaymentMethod.Automatic &&
      tenant.type === TENANT_TYPE.BUSINESS
    ) {
      await this.financeService.updateFinanceStatus(
        financyEntry,
        PaymentStatus.PlannedForSent,
      );

      if (!tenant.hasExactOnline()) {
        this.logger.warn(`[${agreement.id}] Exact is not ready.`);
        await this.financeService.updateFinanceStatus(
          financyEntry,
          PaymentStatus.PaymentProviderNotReady,
        );
        return;
      }
      if (!renter.exactId) {
        this.logger.warn(`[${agreement.id}] Renter has no exact id.`);
        await this.financeService.updateFinanceStatus(
          financyEntry,
          PaymentStatus.RenterNotFromProvider,
        );
        return;
      }

      if (!this.checkIfPaymentIsToday(agreement)) return;
      const { sent, status, exact } = await this.sendExactRequest(
        renter,
        financyEntry,
        tenant,
      );

      this.logger.warn(`[${agreement.id}] sent: ${sent} and status: ${status}`);
      await this.financeService.updateFinanceStatus(
        financyEntry,
        status,
        exact,
      );
    } else {
      this.logger.warn('Manual Flow called');
      if (!this.checkIfPaymentIsToday(agreement)) return;
      const { sent, status } = await this.sendManualPaymentRequest(
        renter,
        agreement,
        financyEntry,
        property,
        tenant,
      );

      this.logger.warn(`[${agreement.id}] sent: ${sent} and status: ${status}`);
      await this.financeService.updateFinanceStatus(financyEntry, status);
    }

    return;
  }

  async sendManualPaymentRequest(
    renter: Renter,
    agreement: Agreement,
    requestFinance: Finance,
    property: Property,
    tenant: Tenant,
  ): Promise<{ sent: boolean; status: PaymentStatus }> {
    const data = {
      property_address: `${property.city} ${property.street}`,
      month: moment().month.toString(),
      year: moment().year.toString(),
      tenant_name: tenant.name,
      finance_price: requestFinance.amount,
      renter_first_name: renter.first_name,
      renter_last_name: renter.last_name,
      renter_email: renter.email,
      renter_phone: renter.phone,
      renter_invoice_email: renter.invoice_email,
    };
    const sent = await this.emailService.sendEmail(
      renter.email,
      'Betaalverzoek',
      `Betaal verzoek voor: ${property.street} ${property.house_number} ${property.extension}, ${property.city} ${property.zip_code}, ${property.country}`,
      data,
      this.configService.get('SEND_GRID_MANUAL_PAYMENT_REQUEST_TEMPLATE'),
    );

    return {
      sent,
      status: sent ? PaymentStatus.Sent : PaymentStatus.FailedToSent,
    };
  }

  async sendOppProviderRequest(
    OppProvider: OppProvider,
    renter: Renter,
    requestFinance: Finance,
    agreement: Agreement,
    property: Property,
    tenant: Tenant,
  ): Promise<{
    sent: boolean;
    status: PaymentStatus;
    oppId?: string;
    oppUrl?: string;
  }> {
    this.logger.warn(
      'sending OPP with: requestFinance.amount' + requestFinance.amount,
    );
    const paymentData = {
      merchant_uid: OppProvider.merchantId,
      products: [
        {
          name: 'Huur betaling - Leanspot',
          price: requestFinance.amount * 100,
          quantity: 1,
        },
      ],
      locale: 'nl',
      return_url: this.configService.get('OPP_RETURN_URL'),
      notify_url: this.configService.get('OPP_NOTIFY_URL'),
      total_price: requestFinance.amount * 100,
      checkout: false,
      metadata: {
        external_id: `${requestFinance.id}`,
      },
    };

    const createTransactionUrl = `${this.configService.get(
      'OPP_PAYMENT_URL',
    )}/transactions`;
    this.logger.warn(`[${agreement.id}] creating payment link...`);

    const createTransaction: ResponseCreateTransaction =
      await this.webRequestService.sendPostRequest(
        createTransactionUrl,
        paymentData,
      );

    this.logger.warn(`[${agreement.id}] creation succesful, sending email`);

    const sent = await this.emailService.sendEmail(
      renter.email,
      'Betaalverzoek',
      `Betaal verzoek voor: ${property.street} ${property.house_number} ${property.extension}, ${property.city} ${property.zip_code}, ${property.country}`,
      {
        payment_link: createTransaction.redirect_url,
        renter: `${renter.first_name} ${renter.last_name}`,
        address: `${property.city} ${property.street}`,
        month: moment().month,
        year: moment().year,
        tenant: tenant.name,
      },
      this.configService.get('SEND_GRID_AUTOMATIC_PAYMENT_REQUEST_TEMPLATE'),
    );

    return {
      sent,
      status: sent ? PaymentStatus.Sent : PaymentStatus.FailedToSent,
      oppId: createTransaction.uid,
      oppUrl: createTransaction.redirect_url,
    };
  }

async sendExactRequest(
    renter: Renter,
    requestFinance: Finance,
    tenant: Tenant,
  ): Promise<{
    sent: boolean;
    status: PaymentStatus;
    exact?: ExactFinanceInterface;
  }> {
    this.logger.warn(
      `Sending Exact request for finance ID: ${requestFinance.id}, amount: ${requestFinance.amount}`,
    );
    try {
      const exactData = await this.exactOnlineService.getExactData(tenant.id);
      if (!exactData.division) {
        this.logger.error(`Exact Online division not set for tenant ${tenant.id}. Cannot create sales invoice.`);
        return {
          sent: false,
          status: PaymentStatus.PaymentProviderNotReady, // Or a more specific status
        };
      }

      this.logger.log(`Renter Exact ID: ${renter.exactId}`);
      this.logger.log(`LogisticalItems for finance ${requestFinance.id}: ${JSON.stringify(requestFinance.logisticalItems)}`);

      const salesInvoiceResponse = await this.exactOnlineService.createSalesInvoice(
        exactData,
        renter.exactId,
        requestFinance.logisticalItems,
      );

      const salesInvoiceDetails = salesInvoiceResponse.d;
      const exactFinanceData: ExactFinanceInterface = {
        id: salesInvoiceDetails.InvoiceID, // This is the GUID
        invoice: salesInvoiceDetails.OrderNumber, // This is usually the human-readable invoice number
      };

      this.logger.log(
        `Sales invoice created successfully in Exact Online for finance ID: ${requestFinance.id}. InvoiceID: ${exactFinanceData.id}, InvoiceNumber: ${exactFinanceData.invoice}`,
      );

      // New: Send printed sales invoice unless the tenant setting is disabled
      if (!exactData.dontSendInvoiceAfterCreation && exactFinanceData.id) {
        this.logger.log(`Tenant ${tenant.id} has automatic invoice sending enabled. Attempting to send/print invoice ${exactFinanceData.id}.`);
        try {
          await this.exactOnlineService.sendPrintedSalesInvoice(exactData, exactFinanceData.id);
          this.logger.log(`Successfully initiated sending/printing of invoice ${exactFinanceData.id} for tenant ${tenant.id}.`);
        } catch (printError) {
          this.logger.error(
            `Failed to send/print Exact Online invoice ${exactFinanceData.id} for tenant ${tenant.id} after creation. Continuing without re-throwing. Error: ${printError.message}`,
          );
        }
      } else {
         this.logger.log(`Sending/printing invoice for ${exactFinanceData.id} is skipped. dontSendInvoiceAfterCreation: ${exactData.dontSendInvoiceAfterCreation}`);
      }

      return {
        sent: true,
        status: PaymentStatus.Sent,
        exact: exactFinanceData,
      };
    } catch (e) {
      this.logger.error(
        `Error during Exact Online request for finance ID: ${requestFinance.id}, tenant ID: ${tenant.id}. Error: ${e.message}`,
        e.stack,
      );
      // Determine if the error was due to provider not ready or another failure
      if (e instanceof UnprocessableEntityException && e.message.includes("Exact.forgot authenticate()?")) {
         return { sent: false, status: PaymentStatus.PaymentProviderNotReady };
      }
      return {
        sent: false,
        status: PaymentStatus.FailedToSent,
      };
    }
    // const paymentData = {
    //   merchant_uid: OppProvider.merchantId,
    //   products: [
    //     {
    //       name: 'Huur betaling - Leanspot',
    //       price: requestFinance.amount * 100,
    //       quantity: 1,
    //     },
    //   ],
    //   locale: 'nl',
    //   return_url: this.configService.get('OPP_RETURN_URL'),
    //   notify_url: this.configService.get('OPP_NOTIFY_URL'),
    //   total_price: requestFinance.amount * 100,
    //   checkout: false,
    //   metadata: {
    //     external_id: requestFinance.transactionId,
    //   },
    // };
    //
    // const createTransactionUrl = `${this.configService.get(
    //   'OPP_PAYMENT_URL',
    // )}/transactions`;
    // this.logger.warn(`[${agreement.id}] creating payment link...`);
    //
    // const createTransaction: ResponseCreateTransaction =
    //   await this.webRequestService.sendPostRequest(
    //     createTransactionUrl,
    //     paymentData,
    //   );
    //
    // this.logger.warn(`[${agreement.id}] creation succesful, sending email`);
    //
    // const sent = await this.emailService.sendEmail(
    //   renter.email,
    //   'Betaalverzoek',
    //   `Betaal verzoek voor: ${property.title}`,
    //   {
    //     payment_link: createTransaction.redirect_url,
    //     renter: `${renter.first_name} ${renter.last_name}`,
    //     address: `${property.city} ${property.street}`,
    //     month: moment().month,
    //     year: moment().year,
    //     tenant: tenant.name,
    //   },
    //   this.configService.get('SEND_GRID_AUTOMATIC_PAYMENT_REQUEST_TEMPLATE'),
    // );
    //
    // return {
    //   sent,
    //   status: sent ? PaymentStatus.Sent : PaymentStatus.FailedToSent,
    // };
  }

  checkIfPaymentIsToday = (agreement: Agreement) => {
    const today = moment().date();
    if (agreement.paymentDate != today) {
      this.logger.warn(
        `[${agreement.id}] Payment date is not today. ${today} ${agreement.paymentDate}`,
      );
      return false;
    }
    return true;
  };
}
