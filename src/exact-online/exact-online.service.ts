import {
  SalesInvoice,
  SalesInvoiceResponseInterface,
} from './interfaces/SalesInvoiceInterface';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthAuthorizationCodeBodyInterface } from './interfaces/OAuthAuthorizationCodeBodyInterface';
import { OAuthRefreshTokenBodyInterface } from './interfaces/OAuthRefreshTokenBodyInterface';
import { StorageInterface } from './interfaces/StorageInterface';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Repository } from 'typeorm';
import { Division } from './interfaces/DivisionsInterface';
import { UpdateExactDto } from './dto/update-exact-dto';
import * as moment from 'moment';
import { Moment } from 'moment';

import {
  AccountInterface,
  AccountSelected,
  AccountsResponseInterface,
  CreateAccountResponseInterface,
} from './interfaces/AccountInterface';
import { CreateRenterDto } from '../renters/dto/create-renter.dto';
import { UpdateRenterDto } from '../renters/dto/update-renter.dto';
import {
  ExactVatCodesInterface,
  MappedVatCodes,
  ReceivablesList,
  ReceivablesListInterface,
  VatCodesInterface,
  VatCodesResponseInterface,
} from './interfaces/VatCodesInterface';
import { UpdateExactVatCodesDto } from './dto/update-exact-vat-codes-dto';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';
import {
  CreateExactItemInterface,
  ExactItemResponseInterface,
  ExactPartialItemResponseInterface,
  ItemsInterface,
} from './interfaces/ItemsInterface';
import {
  LOGISTICAL_TYPE,
  LogisticalItem,
} from '../logistical_items/entities/logistical_item.entity';
import { Finance } from '../finance/entites/finance.entity';

export interface ExactData {
  items: ItemsInterface | null;
  refreshToken: string | null;
  token: string | null;
  expiresAt: Moment | null;
  storageInterface: StorageInterface | null;
  divisions: Division[] | null;
  vatCodes: ExactVatCodesInterface[] | null;
  mappedVatCodes: MappedVatCodes | null;
  division: number | null;
  tenant: Tenant;
  dontSendInvoiceAfterCreation: boolean;
}

@Injectable()
export class ExactOnlineService {
  private readonly logger = new Logger(ExactOnlineService.name);

  private GRANT_TYPE_REFRESH_TOKEN = 'refresh_token';
  private GRANT_TYPE_AUTHORIZATION_CODE = 'authorization_code';

  clientId: string;
  clientSecret: string;
  redirectUri: string;
  // private tenant: Tenant | null = null;
  // private storageInterface: StorageInterface | null = null;
  // private token: string | null = null;
  // private divisions: Division[] | null = null;
  // private division: number | null = null;
  // private refreshToken: string | null = null;
  // private vatCodes: ExactVatCodesInterface[] | null = null;
  // private mappedVatCodes: MappedVatCodes | null = null;
  // private items: ItemsInterface = {
  //   [LOGISTICAL_TYPE.RENT]: '',
  //   [LOGISTICAL_TYPE.DEPOSIT]: '',
  //   [LOGISTICAL_TYPE.SERVICE_FEE]: '',
  //   [LOGISTICAL_TYPE.OHTER]: '',
  // };
  // private expiresAt: Date | null = null;
  private baseApiUrl = 'https://start.exactonline.nl';

  constructor(
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    @InjectRepository(TaxCode) private taxCodeRepository: Repository<TaxCode>,
    @InjectRepository(Finance) private financeRepository: Repository<Finance>,
    configService: ConfigService,
  ) {
    this.redirectUri = configService.get('EXACT_ONLINE_REDIRECT_URI');
    this.clientId = configService.get('EXACT_ONLINE_CLIENT_ID');
    this.clientSecret = configService.get('EXACT_ONLINE_CLIENT_SECRET');
  }

  public async getExactData(tenantId: number): Promise<ExactData> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: +tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const storageInterface = tenant.getStorageWrapper();
    const refreshToken: string | null = await storageInterface.get(
      'refreshToken',
    );
    const token: string | null = await storageInterface.get('token');
    const expiresAt: number | null = await storageInterface.get('expiresAt');
    const divisions: Division[] | null = await storageInterface.get(
      'divisions',
    );
    const items: ItemsInterface | null = (await storageInterface.get(
      'items',
    )) || {
      [LOGISTICAL_TYPE.RENT]: '',
      [LOGISTICAL_TYPE.DEPOSIT]: '',
      [LOGISTICAL_TYPE.SERVICE_FEE]: '',
      [LOGISTICAL_TYPE.OHTER]: '',
    };
    const vatCodes: ExactVatCodesInterface[] | null =
      await storageInterface.get('vatCodes');
    const mappedVatCodes: MappedVatCodes | null = await storageInterface.get(
      'mappedVatCodes',
    );
    const division: number | null = await storageInterface.get('division');
    const dontSendInvoiceAfterCreation: boolean | undefined = await storageInterface.get('dontSendInvoiceAfterCreation');

    return {
      items,
      refreshToken,
      token,
      storageInterface,
      expiresAt: expiresAt ? moment.unix(expiresAt) : null,
      divisions,
      vatCodes,
      mappedVatCodes,
      division,
      tenant,
      dontSendInvoiceAfterCreation: !!dontSendInvoiceAfterCreation,
    };
  }

  static transformExactDateToDateObject(date: string): string {
    const parsedDate = /\/Date\((\d*)\)\//.exec(date);
    if (!parsedDate || !parsedDate?.length || !parsedDate[1]) {
      console.error('Exact date could not be parsed', date, parsedDate);
      return date;
    }
    const dateObj = new Date(+parsedDate[1]);
    return dateObj.toISOString().substring(0, 10);
  }
  static transformExactDateToDate(date: string): Date | null {
    const parsedDate = /\/Date\((\d*)\)\//.exec(date);
    if (!parsedDate || !parsedDate?.length || !parsedDate[1]) {
      console.error('Exact date could not be parsed', date, parsedDate);
      return null;
    }
    return new Date(+parsedDate[1]);
  }

  public async getExactDetails(tenantId: number) {
    const exactData = await this.getExactData(tenantId);
    return {
      login: {
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        responseType: 'code',
        tenant: exactData.tenant.id,
      },
      items: exactData.items,
      active: !!exactData.refreshToken,
      divisions: exactData.divisions,
      mappedVatCodes: exactData.mappedVatCodes,
      division: exactData.division,
      tenant: exactData.tenant,
      dontSendInvoiceAfterCreation: exactData.dontSendInvoiceAfterCreation,
    };
  }

  private getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private isTokenExpired(exactData: ExactData): boolean {
    if (null === exactData.expiresAt) {
      return true;
    }
    const expiresAt = moment(exactData.expiresAt);

    if (!expiresAt.isValid()) {
      return true;
    }

    return moment() >= expiresAt;
  }

  async authenticate(
    exactData: ExactData,
    authorizationCode: string | null = null,
  ) {
    let body:
      | OAuthAuthorizationCodeBodyInterface
      | OAuthRefreshTokenBodyInterface
      | null;

    if (authorizationCode) {
      body = <OAuthAuthorizationCodeBodyInterface>{
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: decodeURIComponent(authorizationCode),
        grant_type: this.GRANT_TYPE_AUTHORIZATION_CODE,
        redirect_uri: this.redirectUri,
      };
    } else {
      body = <OAuthRefreshTokenBodyInterface>{
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: exactData.refreshToken,
        grant_type: this.GRANT_TYPE_REFRESH_TOKEN,
      };
    }

    const params = new URLSearchParams(body);
    const contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
    return fetch(`${this.baseApiUrl}/api/oauth2/token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': contentType,
      },
      body: params.toString(),
    })
      .then(async (r) => {
        if (r.status > 299) {
          const rt = await r.text();
          throw new UnprocessableEntityException(
            `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
          );
        }
        return r.json();
      })
      .then(async (json) => {
        const { access_token: accessToken, refresh_token: refreshToken } = json;
        await exactData.storageInterface.set('token', accessToken);
        await exactData.storageInterface.set('refreshToken', refreshToken);

        const expiresIn = parseInt(json['expires_in']) - 30;
        const expiresAt = moment();
        expiresAt.add(expiresIn, 'seconds');
        await exactData.storageInterface.set('expiresAt', expiresAt.unix());
        return {
          accessToken,
          refreshToken,
          expiresAt,
        };
      });
  }

  async call(exactDataTenantId: ExactData, route: string, init: RequestInit) {
    // Fetch tokens from storage
    const exactData = await this.getExactData(exactDataTenantId.tenant.id);

    if (exactData.refreshToken === null) {
      throw new Error('Not authenticated with Exact. forgot authenticate()?');
    }
    let token = exactData.token;
    // If the stored token is expired, refresh it.
    if (this.isTokenExpired(exactData)) {
      const { accessToken } = await this.authenticate(exactData);
      if (accessToken) {
        token = accessToken;
      }
    }

    // When passing __next it's an absolute url.
    route = route.replace(this.baseApiUrl, '');
    // Do the actual call.
    init.headers = { ...init.headers, ...this.getHeaders(token) };
    return fetch(`${this.baseApiUrl}${route}`, init);
  }

  // async *getSyncSalesInvoices(
  //   previousTimestamp = 1,
  //   fields: Array<string> = [
  //     'ID',
  //     'InvoiceToContactPersonFullName',
  //     'InvoiceToName',
  //     'InvoiceNumber',
  //     'Type',
  //     'TypeDescription',
  //     'Status',
  //     'StatusDescription',
  //     'Journal',
  //     'JournalDescription',
  //     'AmountFCExclVat',
  //     'AmountFC',
  //     'InvoiceDate',
  //     'DueDate',
  //   ],
  // ): AsyncIterableIterator<SalesInvoiceInterface> {
  //   const params = new URLSearchParams();
  //   params.append('$filter', `Timestamp gt ${previousTimestamp}`);
  //   params.append('$select', fields.join(','));
  //
  //   let next = 'first';
  //   while (next) {
  //     const url = `/api/v1/${
  //       this.division
  //     }/sync/SalesInvoice/SalesInvoices?${params.toString()}`;
  //     const res = await this.call(next === 'first' ? url : next, {
  //       method: 'GET',
  //     }).then(async (r) => r.json());
  //
  //     const results = res?.d?.results || [];
  //     next = res?.d?.__next;
  //
  //
  //     for (const item of results) {
  //       yield item;
  //     }
  //   }
  // }
  //
  // async createSalesInvoice(
  //   data: SalesInvoiceInterface,
  // ): Promise<SalesInvoiceInterface> {
  //   const url = `/api/v1/${this.division}/SalesInvoice/SalesInvoices`;
  //   return <SalesInvoiceInterface>await this.call(url, {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //   }).then(async (r) => r.json());
  // }
  //
  // async updateSalesInvoice(
  //   guid: string,
  //   data: SalesInvoiceInterface,
  // ): Promise<SalesInvoiceInterface> {
  //   const url = `/api/v1/${this.division}/SalesInvoice/SalesInvoices(guid'${guid}')`;
  //   return <SalesInvoiceInterface>await this.call(url, {
  //     method: 'PUT',
  //     body: JSON.stringify(data),
  //   }).then(async (r) => r.json());
  // }
  //
  // async deleteSalesInvoice(guid: string): Promise<boolean> {
  //   const url = `/api/v1/${this.division}/SalesInvoice/SalesInvoices(guid'${guid}')`;
  //   return await this.call(url, {
  //     method: 'DELETE',
  //   })
  //     .then(() => true)
  //     .catch(() => false);
  // }
  //
  // async *getSyncContacts(
  //   previousTimestamp = 1,
  //   fields: Array<string> = [
  //     'ID',
  //     'AccountCode',
  //     'AccountName',
  //     'AccountContactName',
  //     'AmountDC',
  //     'TransactionAmountDC',
  //     'Status',
  //     'PaymentMethod',
  //     'DueDate',
  //     'InvoiceDate',
  //     'InvoiceNumber',
  //     'Journal',
  //     'JournalDescription',
  //     'GLAccountCode',
  //     'GLAccountDescription',
  //     'Description',
  //   ],
  // ): AsyncIterableIterator<ContactInterface> {
  //   const params = new URLSearchParams();
  //   params.append('$filter', `Timestamp gt ${previousTimestamp}`);
  //   params.append('$select', fields.join(','));
  //
  //   let next = 'first';
  //   while (next) {
  //     const url = `/api/v1/${
  //       this.division
  //     }/sync/CRM/Contacts?${params.toString()}`;
  //     const res = await this.call(next === 'first' ? url : next, {
  //       method: 'GET',
  //     }).then(async (r) => r.json());
  //
  //     const results = res?.d?.results || [];
  //     next = res?.d?.__next;
  //
  //
  //     for (const item of results) {
  //       yield item;
  //     }
  //   }
  // }
  //
  // async createContact(data: ContactInterface): Promise<ContactInterface> {
  //   const url = `/api/v1/${this.division}/crm/Contacts`;
  //
  //   return <ContactInterface>await this.call(url, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json', // Set the content type to JSON
  //     },
  //     body: JSON.stringify(data), // Stringify the data object as JSON
  //   })
  //     .then(async (r) => {
  //       if (r.status > 299) {
  //         const rt = await r.text();
  //         throw new UnprocessableEntityException(
  //           `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
  //         );
  //       }
  //       return r.json();
  //     })
  //     .then(async (r) => {
  //       return r.json();
  //     });
  // }
  //
  // async updateContact(
  //   contactGuid: string,
  //   data: ContactInterface,
  // ): Promise<ContactInterface> {
  //   const url = `/api/v1/${this.division}/crm/Contacts(guid'${contactGuid}')`;
  //   return <ContactInterface>await this.call(url, {
  //     method: 'PUT',
  //     body: JSON.stringify(data),
  //   }).then(async (r) => r.json());
  // }

  async createAccount(
    exactData: ExactData,
    createDto: CreateRenterDto,
  ): Promise<CreateAccountResponseInterface> {
    const accountData: AccountInterface = {
      Name:
        createDto.company_name ||
        createDto.first_name + ' ' + createDto.last_name,
      Email: createDto.email,
      Phone: createDto.phone,
      AddressLine1:
        createDto.invoice_street +
        ' ' +
        createDto.invoice_housenumber +
        ' ' +
        createDto.invoice_extensions,
      City: createDto.invoice_city,
      Postcode: createDto.invoice_zipcode,
      VATNumber: createDto.tax_id,
      ChamberOfCommerce: createDto.kvk,
      Status: 'C',
    };
    const url = `/api/v1/${exactData.division}/crm/Accounts`;
    return <CreateAccountResponseInterface>await this.call(exactData, url, {
      method: 'POST',
      body: JSON.stringify(accountData), // Stringify the data object as JSON
    }).then(async (r) => {
      if (r.status > 299) {
        const rt = await r.text();
        throw new UnprocessableEntityException(
          `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
        );
      }
      return r.json();
    });
  }

  async createSalesInvoice(
    exactData: ExactData,
    accountGuid: string,
    logisticalItems: LogisticalItem[],
  ): Promise<SalesInvoiceResponseInterface> {
    const items = await this.getOrSetItems(exactData);
    
    // Debug logging
    this.logger.log(`Creating sales invoice with ${logisticalItems.length} logistical items`);
    this.logger.log(`MappedVatCodes: ${JSON.stringify(exactData.mappedVatCodes)}`);
    
    // Check if VAT codes are mapped
    if (!exactData.mappedVatCodes) {
      throw new UnprocessableEntityException(
        'VAT codes are not mapped for this tenant. Please configure VAT code mapping in Exact Online settings first.',
      );
    }
    
    const accountData: SalesInvoice = {
      OrderedBy: accountGuid,
      SalesInvoiceLines: logisticalItems.map((item) => {
        if (!items[item.type]) {
          throw new UnprocessableEntityException(
            `Item ${item.type} not found in Exact.`,
          );
        }
        if (!exactData.mappedVatCodes[item.tax_code.id]) {
          throw new UnprocessableEntityException(
            `VAT code ${item.tax_code.id} (${item.tax_code.name}) is not mapped to an Exact Online VAT code. Please configure VAT code mapping first.`,
          );
        }
        let description = 'Overige';
        switch (item.type) {
          case LOGISTICAL_TYPE.DEPOSIT:
            description = 'Borg';
            break;
          case LOGISTICAL_TYPE.SERVICE_FEE:
            description = 'Servicekosten';
            break;
          case LOGISTICAL_TYPE.RENT:
            description = 'Huur';
            break;
          case LOGISTICAL_TYPE.OHTER:
            description = item.name;
            break;
        }
        return {
          Item: items[item.type],
          Quantity: 1,
          UnitPrice: item.amount,
          VATCode: exactData.mappedVatCodes[item.tax_code.id],
          Description: description,
        };
      }),
    };
    const url = `/api/v1/${exactData.division}/SalesInvoice/SalesInvoices`;
    return <SalesInvoiceResponseInterface>await this.call(exactData, url, {
      method: 'POST',
      body: JSON.stringify(accountData), // Stringify the data object as JSON
    })
      .then(async (r) => {
        if (r.status > 299) {
          const rt = await r.text();
          throw new UnprocessableEntityException(
            `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
          );
        }
        return r.json();
      });
  }

  async sendPrintedSalesInvoice(
    exactData: ExactData,
    invoiceId: string,
  ): Promise<any> { // You might want to define a more specific response interface
    this.logger.log(`Sending printed sales invoice for InvoiceID: ${invoiceId}`);
    const payload = {
      InvoiceID: invoiceId,
      SendEmailToCustomer: true, // Defaulting to true, could be made configurable
      // SendOutputBasedOnAccount: false, // Explicitly false if SendEmailToCustomer is true
      // DocumentLayout: 'GUID_OF_DOCUMENT_LAYOUT', // Optional: Specify if needed
      // EmailLayout: 'GUID_OF_EMAIL_LAYOUT', // Optional: Specify if needed
    };
    const url = `/api/v1/${exactData.division}/salesinvoice/PrintedSalesInvoices`;
    return this.call(exactData, url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        if (r.status > 299) {
          // Exact Online often returns 201 for successful POST that creates an entity,
          // but for actions like this, it might be 200 or another success code.
          // The documentation does not specify the success status code for this endpoint.
          // We'll treat any status > 299 as an error for now.
          const rt = await r.text();
          this.logger.error(
            `Error sending printed sales invoice. Status: ${r.status} ${r.statusText}. Response: ${rt}`,
          );
          throw new UnprocessableEntityException(
            `Received ${r.status} ${r.statusText} ${rt} from Exact when sending printed sales invoice.`,
          );
        }
        this.logger.log(`Printed sales invoice request successful for InvoiceID: ${invoiceId}. Status: ${r.status}`);
        try {
          return await r.json(); // Attempt to parse JSON, might be empty or non-JSON for some success responses
        } catch (e) {
          this.logger.warn(`Response for sending printed sales invoice was not JSON for InvoiceID: ${invoiceId}. Status: ${r.status}. It might still be a success.`);
          return { success: true, status: r.status, responseText: await r.text() }; // Or handle non-JSON success appropriately
        }
      })
      .catch((error) => {
        this.logger.error(`Failed to send printed sales invoice for InvoiceID: ${invoiceId}`, error.stack);
        throw error; // Re-throw the exception to be handled by the caller
      });
  } 


  async updateAccount(
    exactData: ExactData,
    contactGuid: string,
    updateDto: UpdateRenterDto,
  ): Promise<void> {
    const accountData: AccountInterface = {
      Name: updateDto.first_name,
      Email: updateDto.email,
      Phone: updateDto.phone,
      AddressLine1:
        updateDto.invoice_street +
        ' ' +
        updateDto.invoice_housenumber +
        ' ' +
        updateDto.invoice_extensions,
      City: updateDto.invoice_city,
      Postcode: updateDto.invoice_zipcode,
      VATNumber: updateDto.tax_id,
    };
    const url = `/api/v1/${exactData.division}/crm/Accounts(guid'${contactGuid}')`;
    await this.call(exactData, url, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    }).then(async (r) => {
      if (r.status === 204) {
        return;
      }
      if (r.status > 299) {
        const rt = await r.text();
        throw new UnprocessableEntityException(
          `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
        );
      }
      return r.json();
    });
  }

  // async deleteContact(contactGuid: string): Promise<boolean> {
  //   const url = `/api/v1/${this.division}/crm/Contacts(guid'${contactGuid}')`;
  //   return await this.call(url, {
  //     method: 'DELETE',
  //   })
  //     .then(() => true)
  //     .catch(() => false);
  // }
  //

  async getAccounts(exactData: ExactData) {
    const accounts: AccountSelected[] = [];
    for await (const account of this.getAccountsIteratble(exactData)) {
      accounts.push(account);
    }
    return accounts;
  }

  async *getAccountsIteratble(
    exactData: ExactData,
  ): AsyncIterableIterator<AccountSelected> {
    // Name:
    //     createDto.company_name ||
    //     createDto.first_name + ' ' + createDto.last_name,
    //         Email: createDto.email,
    //     Phone: createDto.phone,
    //     AddressLine1:
    // createDto.invoice_street +
    // ' ' +
    // createDto.invoice_housenumber +
    // ' ' +
    // createDto.invoice_extensions,
    //     City: createDto.invoice_city,
    //     Postcode: createDto.invoice_zipcode,
    //     VATNumber: createDto.tax_id,
    //     ChamberOfCommerce: createDto.kvk,
    //     Status: 'C',
    const fields: Array<string> = [
      'ID',
      'Code',
      'Name',
      'Phone',
      'ChamberOfCommerce',
      'Email',
      'Status',
      'AddressLine1',
      'City',
      'Postcode',
      'VATNumber',
    ];
    const params = new URLSearchParams();
    params.append('$select', fields.join(','));

    let next = 'first';
    while (next) {
      const url = `/api/v1/${
        exactData.division
      }/bulk/CRM/Accounts?${params.toString()}`;
      const res = <AccountsResponseInterface>await this.call(
        exactData,
        next === 'first' ? url : next,
        { 
          method: 'GET',
        },
      ).then(async (r) => {
        if (r.status > 299) {
          const rt = await r.text();
          throw new UnprocessableEntityException(
            `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
          );
        }
        return r.json();
      });

      const results = res?.d?.results || [];
      next = res?.d?.__next;

      for (const item of results) {
        if (item.Status !== 'C') {
          continue;
        }
        yield item;
      }
    }
  }

  async getDivisions(
    exactData: ExactData,
    division: number,
  ): Promise<Array<Record<string, string>>> {
    return this.call(exactData, `/api/v1/${division}/system/Divisions`, {
      method: 'GET',
    }).then(async (r) => {
      const data = await r.json();
      return data?.d?.results?.map((d: any) => ({
        code: d.Code,
        name: d.Description,
      }));
    });
  }

  async getVatCodes(exactData: ExactData): Promise<VatCodesResponseInterface> {
    return <VatCodesResponseInterface>await this.call(
      exactData,
      `/api/v1/${exactData.division}/vat/VATCodes`,
      {
        method: 'GET',
      },
    ).then(async (r) => {
      const data = <VatCodesResponseInterface>await r.json();
      return data?.d?.results?.map((d: VatCodesInterface) => {
        return {
          id: d.ID,
          code: d.Code,
          name: d.Description,
          Percentage: d.Percentage,
        };
      });
    });
  }

  /*Here we get all received money since yesterday start so 00:00:00 only if amount is higher then 0, the invocie date is also the date when the mioney is collected from the cusotmer*/
  async getOpenInvoices(
    exactData: ExactData,
  ): Promise<
    { id: string; amount: number; invoice: number; invoiceDate: Date | null }[]
  > {
    const yesterdayStart = moment().subtract(1000, 'days').startOf('day');
    const dateTimeFormattedStart = yesterdayStart.format('YYYY-MM-DDTHH:mm:ss');
    const filter = `Amount ne 0 and InvoiceDate gt datetime'${dateTimeFormattedStart}'`;
    const url = `/api/v1/${
      exactData.division
    }/read/financial/ReceivablesList?$filter=${encodeURIComponent(
      filter,
    )}&$select=Amount,DueDate,InvoiceDate,InvoiceNumber,AccountId,Id`;

    return await this.call(exactData, url, {
      method: 'GET',
    }).then(async (r) => {
      const data = <ReceivablesListInterface>await r.json();
      return data?.d?.results?.map((d: ReceivablesList) => {
        return {
          id: d.Id,
          amount: d.Amount,
          invoice: d.InvoiceNumber,
          invoiceDate: ExactOnlineService.transformExactDateToDate(
            d.InvoiceDate,
          ),
        };
      });
      // return data?.d?.results?.map((d: VatCodesInterface) => {
      //   return {
      //     id: d.ID,
      //     code: d.Code,
      //     name: d.Description,
      //     Percentage: d.Percentage,
      //   };
      // });
    });
  }

  async getCurrentDivision(exactData: ExactData): Promise<number> {
    return this.call(exactData, '/api/v1/current/Me?$select=CurrentDivision', {
      method: 'GET',
    }).then(async (r) => {
      const data = await r.json();
      return parseInt(data?.d?.results?.[0]?.['CurrentDivision']);
    });
  }

  async setDivisions(exactData: ExactData) {
    const currentDivision = await this.getCurrentDivision(exactData);
    const divisions = await this.getDivisions(exactData, currentDivision);
    await exactData.storageInterface.set('divisions', divisions);
  }

  async setAndGetVatCodes(exactData: ExactData) {
    const vatCodes = await this.getVatCodes(exactData);
    await exactData.storageInterface.set('vatCodes', vatCodes);
    return vatCodes;
  }

  async getMappedVatCodes(exactData: ExactData) {
    const mapped = {};
    const taxCodes = await this.taxCodeRepository.find();
    taxCodes.forEach((t) => (mapped[t.id] = null));
    const mappedVatCodes = await exactData.storageInterface.get(
      'mappedVatCodes',
    );
    return Object.assign(mapped, mappedVatCodes);
  }

  async setDivision(exactData: ExactData, updateExactDto: UpdateExactDto) {
    await exactData.storageInterface.set('division', updateExactDto.division);
    // Handle setting dontSendInvoiceAfterCreation if it's part of UpdateExactDto
    if (updateExactDto.hasOwnProperty('dontSendInvoiceAfterCreation')) {
       await exactData.storageInterface.set('dontSendInvoiceAfterCreation', !!updateExactDto['dontSendInvoiceAfterCreation']);
    }
    return this.getExactDetails(exactData.tenant.id);
  }

  async getOrSetItems(exactData: ExactData) {
    const exactItems = exactData.items;
    const items = Object.entries(exactItems);

    for (const [key, item] of items as [key: LOGISTICAL_TYPE, item: string][]) {
      if (!item) {
        let exactCode = '';
        const existingExactItem = await this.getExactItem(exactData, key);
        if (existingExactItem?.d?.results[0]?.ID) {
          exactCode = existingExactItem.d.results[0].ID;
        } else {
          const ExactItem = await this.createItem(exactData, key);
          exactCode = ExactItem.d.ID;
        }
        exactItems[key] = exactCode;
      } else {
      }
    }
    await exactData.storageInterface.set('items', exactItems);
    return exactItems;
  }

  async createItem(
    exactData: ExactData,
    key: LOGISTICAL_TYPE,
  ): Promise<ExactItemResponseInterface> {
    this.logger.log(`Creating exact item ${key}`);
    // const SalesVatCode = this.mappedVatCodes[LogiticalItem.tax_code.id];
    // if (!SalesVatCode) {
    //   throw new BadRequestException('No SalesVatCode found for this item');
    // }
    let description = 'Overige';
    switch (key) {
      case LOGISTICAL_TYPE.DEPOSIT:
        description = 'Borg';
        break;
      case LOGISTICAL_TYPE.SERVICE_FEE:
        description = 'Servicekosten';
        break;
      case LOGISTICAL_TYPE.RENT:
        description = 'Huur';
        break;
    }
    const data: CreateExactItemInterface = {
      Code: `LEANSPOT_${key.toUpperCase()}`,
      Description: description,
      IsSalesItem: true,
      // SalesVatCode: SalesVatCode,
      CostPriceCurrency: 'EUR',
    };
    return <ExactItemResponseInterface>await this.call(
      exactData,
      `/api/v1/${exactData.division}/logistics/Items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify(data), // Stringify the data object as JSON
      },
    ).then(async (r) => {
      if (r.status > 299) {
        const rt = await r.text();
        throw new UnprocessableEntityException(
          `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
        );
      }
      return r.json();
    });
  }

  async getExactItem(
    exactData: ExactData,
    key: LOGISTICAL_TYPE,
  ): Promise<ExactPartialItemResponseInterface> {
    this.logger.log(`Get exact item ${key}`);

    const exactCode = `LEANSPOT_${key.toUpperCase()}`;
    return <ExactPartialItemResponseInterface>await this.call(
      exactData,
      `/api/v1/${exactData.division}/logistics/Items?$filter=Code eq '${exactCode}'`,
      {
        method: 'GET',
      },
    ).then(async (r) => {
      if (r.status > 299) {
        const rt = await r.text();
        throw new UnprocessableEntityException(
          `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
        );
      }
      return r.json();
    });
  }

  async getAccount(
    exactData: ExactData,
    exactId: string,
  ): Promise<AccountsResponseInterface> {
    this.logger.log(`Get exact account ${exactId}`);

    return <AccountsResponseInterface>await this.call(
      exactData,
      `/api/v1/${exactData.division}/crm/Accounts?$filter=ID eq guid'${exactId}'`,
      {
        method: 'GET',
      },
    ).then(async (r) => {
      if (r.status > 299) {
        const rt = await r.text();
        throw new UnprocessableEntityException(
          `Received ${r.status} ${r.statusText} ${rt} from Exact.`,
        );
      }
      return r.json();
    });
  }

  async setSelectedVatCodes(
    exactData: ExactData,
    updateExactVatCodesDto: UpdateExactVatCodesDto,
  ) {
    const vatCode = await this.taxCodeRepository.findOne({
      where: { id: updateExactVatCodesDto.taxCode },
    });
    if (!vatCode) {
      throw new BadRequestException('Vat code not found');
    }
    /*Check if exactTaxCode exists inside this this.vatCodes */
    const exactTaxCode = exactData.vatCodes.find(
      (vatCode) => vatCode.code === updateExactVatCodesDto.exactTaxCode,
    );
    if (!exactTaxCode) {
      throw new BadRequestException('Exact tax code not found');
    }

    const mappedVatCodes = await this.getMappedVatCodes(exactData);
    mappedVatCodes[updateExactVatCodesDto.taxCode] =
      updateExactVatCodesDto.exactTaxCode;

    await exactData.storageInterface.set('mappedVatCodes', mappedVatCodes);
    exactData.mappedVatCodes = mappedVatCodes;
    return this.getExactDetails(exactData.tenant.id);
  }

  async remove(exactData: ExactData) {
    await exactData.storageInterface.clear();
    return this.getExactDetails(exactData.tenant.id);
  }

  async syncOpenInvoices() {
    const activeExactTenants = await this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.finances', 'finance')
      .where("tenant.exact_storage ->> 'division' IS NOT NULL")
      .andWhere("finance.exact ->> 'invoice' IS NOT NULL") // Correct way to reference JSON property
      .andWhere('finance.paidAt IS NULL') // Only consider records with paidAt as NULL
      .getMany();
    for (const tenant of activeExactTenants) {
      const exactData = await this.getExactData(tenant.id);
      const invoices = await this.getOpenInvoices(exactData);
      for (const invoice of invoices) {
        const finance = await this.financeRepository
          .createQueryBuilder('finance')
          .where("finance.exact ->> 'invoice' = :invoice", {
            invoice: invoice.invoice,
          })
          .getOne();

        if (finance) {
          finance.openAmount = invoice.amount;
          if (finance.openAmount >= finance.amount) {
            finance.paidAt = invoice.invoiceDate || new Date();
          }
          await finance.save();
          // Do something with the found finance record
        } else {
          this.logger.warn('Finance not found for::', invoice.invoice);
        }
      }
    }
  }
}
