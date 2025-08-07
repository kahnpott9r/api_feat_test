import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from 'src/pagination/dtos';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { PageDto } from 'src/pagination/page.dto';
import { Property } from 'src/properties/entities/property.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import {
  configQuery,
  getPaginationKeys,
  getStartAndEndDate,
  DURATION,
} from 'src/Utils/utils';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { UpdatePaymentRequestDto } from './dto/update-payment-request.dto';
import {
  Finance,
  FinancialLedgerInterestItem,
  PaymentStatus,
} from './entites/finance.entity';
import { Duration, Kind, Ledger } from './entites/ledger.entity';
import { PaymentRequest } from './entites/payment-request.entity';
import * as moment from 'moment';
import { NotificationTransactionResponse } from 'src/payment/OPPResponse/Compliance';
import { Renter } from 'src/renters/entities/renters.entity';
import {
  AgreementPaymentInfo,
  AgreementsService,
} from 'src/agreements/agreements.service';
import { Agreement } from 'src/agreements/entities/agreement.entity';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';
import { ExactFinanceInterface } from '../exact-online/interfaces/exact.interface';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import {
  MortgageDetails,
  MortgageLine,
} from '../mortgage_lines/entities/mortgage-line.entity';
import {
  calculateAnnuityMortgageDetails,
  calculateLinearMortgageDetails,
} from '../properties/properties.service';

export interface PropertyFinanceOverview {
  finance: Finance;
  ledgers: Ledger[];
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);
  constructor(
    @InjectRepository(Finance) private financeRepository: Repository<Finance>,
    @InjectRepository(TaxCode) private taxRepository: Repository<TaxCode>,
    @InjectRepository(PaymentRequest)
    private paymentRequestRepository: Repository<PaymentRequest>,
    @InjectRepository(Ledger) private ledgerRepository: Repository<Ledger>,
    private agreementService: AgreementsService,
    @InjectRepository(MortgageLine)
    private mortgageLineRepository: Repository<MortgageLine>,
  ) {}

  async createFinanceEntry(
    address: string,
    status: PaymentStatus,
    tenant: Tenant,
    renter: Renter,
    property: Property,
    agreement: Agreement,
    paymentUrl: string,
    agreementPaymentInfo: AgreementPaymentInfo,
  ) {
    const financeData = this.financeRepository.create({
      address,
      status,
      property,
      renter,
      tenant,
      agreement,
      paymentUrl,
      logisticalItems: agreementPaymentInfo.logisticalItems,
      amount: agreementPaymentInfo.amount,
    });
    return await this.financeRepository.save(financeData);
  }

  async updateById(finace: Finance, updatePropertyDto: UpdateFinanceDto) {
    const updateProperty = await this.financeRepository.findOne({
      where: { id: finace.id },
    });
    Object.assign(updateProperty, updatePropertyDto);

    return await updateProperty.save();
  }

  async updateFinanceStatus(
    entry: Finance,
    status: PaymentStatus,
    exact?: ExactFinanceInterface,
    opp?: {
      url: string;
      id: string;
    },
  ) {
    entry.status = status;
    if (exact) {
      entry.exact = exact;
    }
    if (opp?.url) {
      entry.paymentUrl = opp.url;
    }
    if (opp?.id) {
      entry.transactionId = opp.id;
    }
    await this.financeRepository.save(entry);
  }

  async isSentPaymentRequestInThisMonth(agreementId: number) {
    const queryBuilder = this.financeRepository.createQueryBuilder('finance');
    let query = await this.configFinanceRelative(queryBuilder);
    query = query.andWhere('agreement.id = :agreementId', {
      agreementId: agreementId,
    });
    query = query.andWhere('finance.created_at >= :startDate', {
      startDate: moment().startOf('month'),
    });
    query = query.andWhere('finance.created_at <= :endDate', {
      endDate: moment().endOf('month'),
    });
    return await query.getOne();
  }

  async getMostRecentFinancy(agreementId: number, propertyId: number) {
    const queryBuilder = this.financeRepository.createQueryBuilder('finance');
    let query = await this.configFinanceRelative(queryBuilder);
    query = query
      .andWhere('agreement.id = :agreementId', {
        agreementId: agreementId,
      })
      .andWhere('property.id = :propertyId', {
        propertyId: propertyId,
      });
    return await query.getOne();
  }

  async createPaymentRequest(
    tenant: Tenant,
    property: Property,
    createDto: CreatePaymentRequestDto,
  ) {
    const paymentRequest = this.paymentRequestRepository.create({
      property,
      tenant,
      ...createDto,
    });

    await this.paymentRequestRepository.save(paymentRequest);
    return paymentRequest;
  }

  async updatePaymentRequest(id: number, updateDto: UpdatePaymentRequestDto) {
    delete updateDto['tenantId'];
    delete updateDto['propertyId'];
    await this.paymentRequestRepository.update(id, updateDto);
    return 'Payment Request was updated';
  }

  async createPaymentLedger(
    tenant: Tenant,
    property: Property,
    createDto: CreateLedgerDto,
  ) {
    if (createDto.startDate == '') {
      delete createDto['startDate'];
    }
    if (createDto.endDate == '') {
      delete createDto['endDate'];
    }
    const ledger = this.ledgerRepository.create({
      property,
      tenant,
      ...createDto,
    });

    await this.ledgerRepository.save(ledger);
    return ledger;
  }

  async configFinanceRelative(queryBuilder: SelectQueryBuilder<Finance>) {
    return queryBuilder
      .leftJoinAndSelect('finance.renter', 'renter')
      .leftJoinAndSelect('finance.tenant', 'tenant')
      .leftJoinAndSelect('finance.property', 'property')
      .leftJoinAndSelect('finance.agreement', 'agreement')
      .leftJoinAndSelect('agreement.renters', 'renters');
  }

  async getFinanceByTenant(tenantId: number, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.financeRepository.createQueryBuilder('finance');
    let query = await this.configFinanceRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.financeRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'finance',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.financeRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getFinanceRecentByTenant(tenantId: number, duration: string) {
    const queryBuilder = this.financeRepository.createQueryBuilder('finance');
    let query = await this.configFinanceRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.financeRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'finance',
      pageDtoKeys,
      entityFields,
      {},
      this.financeRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    if (duration == DURATION.Today) {
      query = query.andWhere('finance.created_at >= :today', {
        today: moment().add(-1, 'day').endOf('day'),
      });
    } else if (duration == DURATION.Week) {
      query = query.andWhere('finance.created_at >= :today', {
        today: moment().add(-7, 'day').endOf('day'),
      });
    } else if (duration == DURATION.Month) {
      query = query.andWhere('finance.created_at >= :today', {
        today: moment().add(-30, 'day').endOf('day'),
      });
    }
    return await query.limit(6).getMany();
  }

  async updatePaymentLedger(id: number, updateDto: UpdateLedgerDto) {
    if (updateDto.startDate == '') {
      delete updateDto['startDate'];
    }
    if (updateDto.endDate == '') {
      delete updateDto['endDate'];
    }
    delete updateDto['tenantId'];
    delete updateDto['propertyId'];
    await this.ledgerRepository.update(id, updateDto);
    return 'Ledger Request was updated';
  }

  async configPaymentRequestRelative(
    queryBuilder: SelectQueryBuilder<PaymentRequest>,
  ) {
    return queryBuilder
      .leftJoinAndSelect('payment_request.tenant', 'tenant')
      .leftJoinAndSelect('payment_request.property', 'property');
  }

  async getPaymentRequestByProperty(
    propertyId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder =
      this.paymentRequestRepository.createQueryBuilder('payment_request');
    let query = await this.configPaymentRequestRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.paymentRequestRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'payment_request',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.paymentRequestRepository.metadata,
      query,
    );
    query = query.andWhere('property.id = :propertyId', {
      propertyId: propertyId,
    });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getFinanceByProperty(
    propertyId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder = this.financeRepository.createQueryBuilder('finance');
    let query = await this.configFinanceRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.financeRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'finance',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.financeRepository.metadata,
      query,
    );
    query = query.andWhere('property.id = :propertyId', {
      propertyId: propertyId,
    });
    query = query.orderBy('property.created_at', 'ASC');

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getFinanceByPropertyId(id: number) {
    return await this.financeRepository.find({
      where: { property: { id: id } },
    });
  }

  async getFinanceByTenantByDates(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    pageOptionsDto: PageOptionsDto,
    propertyId: number,
  ) {
    const queryBuilder = this.financeRepository.createQueryBuilder('finance');
    let query = await this.configFinanceRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.financeRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'finance',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.financeRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    if (propertyId) {
      query = query.andWhere('property.id = :propertyId', {
        propertyId: propertyId,
      });
    }
    if (startDate) {
      query = query.andWhere('finance.created_at >= :startDate', {
        startDate: startDate,
      });
      query = query.andWhere('finance.created_at <= :endDate', {
        endDate: endDate,
      });
    }

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    return {
      entities,
      itemCount,
    };
  }

  async getLedgerByTenantByDates(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    pageOptionsDto: PageOptionsDto,
    propertId: number,
  ) {
    const queryBuilder = this.ledgerRepository.createQueryBuilder('ledger');
    let query = await this.configLedgerRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.ledgerRepository.metadata.columns.map(
      (col) => col.propertyName,
    );
    query = await configQuery(
      'ledger',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.ledgerRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    if (propertId) {
      query = query.andWhere('property.id = :propertId', {
        propertId: propertId,
      });
    }
    if (startDate) {
      query = query.andWhere('ledger.start_date >= :startDate', {
        startDate: startDate,
      });
      query = query.andWhere('ledger.start_date <= :endDate', {
        endDate: endDate,
      });
    }
    // console.log(query.getSql());
    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    return {
      entities,
      itemCount,
    };
  }

  async convertToFinancialRecord(
    entity: Finance | Ledger,
  ): Promise<FinancialLedgerInterestItem> {
    const financialRecord: FinancialLedgerInterestItem = {
      id: entity.id,
      created_at: entity.created_at,
      property: entity.property,
      amount: entity.amount,
      kind: '',
      ledgerKind: '',
      status: '',
      description: '',
      type: 'finance',
    };
    if (entity instanceof Finance) {
      financialRecord.kind = 'Overeenkomst betaalverzoek';
      financialRecord.status = entity.status;
      financialRecord.type = 'finance';
      if (entity.exact) financialRecord.exact = entity.exact;
      if (entity.transactionId)
        financialRecord.transactionId = entity.transactionId;
      if (entity.paymentUrl) financialRecord.paymentUrl = entity.paymentUrl;
      if (entity.paymentMethod)
        financialRecord.paymentMethod = entity.paymentMethod;
    }
    if (entity instanceof Ledger) {
      financialRecord.description = entity.description;
      financialRecord.ledgerKind = entity.kind;
      if (entity.thirdPartyReference) {
        financialRecord.type = 'mortgage';
        financialRecord.kind = 'Hypotheek';
        financialRecord.mortgageType = entity.mortgageType;
      } else {
        financialRecord.kind = 'Kasboek';
        financialRecord.type = 'ledger';
      }
    }

    return financialRecord;
  }

  async getLedgerMortgageByTenantByDates(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    pageOptionsDto: PageOptionsDto,
    propertId: number,
  ) {
    const queryBuilder = this.ledgerRepository.createQueryBuilder('ledger');
    let query = await this.configLedgerRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.ledgerRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'ledger',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.ledgerRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    if (propertId) {
      query = query.andWhere('property.id = :propertId', {
        propertId: propertId,
      });
    }
    if (startDate) {
      query = query.andWhere('ledger.start_date >= :startDate', {
        startDate: startDate,
      });
      query = query.andWhere('ledger.start_date <= :endDate', {
        endDate: endDate,
      });
    }
    query = query.andWhere('ledger.thirdPartyReference IS NOT NULL');

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    return {
      entities,
      itemCount,
    };
  }

  async getMortgageInterestsOverviewByTenant(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    pageOptionsDto: PageOptionsDto,
    propertId = 0,
  ) {
    const ledger = await this.getLedgerMortgageByTenantByDates(
      tenantId,
      startDate,
      endDate,
      pageOptionsDto,
      propertId,
    );

    console.log(ledger);

    const pageMetaDto = new PageMetaDto({
      itemCount: ledger.itemCount,
      pageOptionsDto,
    });

    const entities = await Promise.all(
      ledger.entities.map(
        async (item) => await this.convertToFinancialRecord(item),
      ),
    );

    const sortedEntities = entities.sort((a, b) => {
      return b.created_at.getTime() - a.created_at.getTime();
    });

    return new PageDto(sortedEntities, pageMetaDto);
  }

  async getFinanceAndLedgersOverviewByTenant(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    pageOptionsDto: PageOptionsDto,
    propertId = 0,
  ) {
    const ledgers = await this.getLedgerByTenantByDates(
      tenantId,
      startDate,
      endDate,
      pageOptionsDto,
      propertId,
    );

    const finances = await this.getFinanceByTenantByDates(
      tenantId,
      startDate,
      endDate,
      pageOptionsDto,
      propertId,
    );
    const pageMetaDto = new PageMetaDto({
      itemCount: ledgers.itemCount + finances.itemCount,
      pageOptionsDto,
    });
    const rawEntities = [...ledgers.entities, ...finances.entities];
    const entities = await Promise.all(
      rawEntities.map(
        async (item) => await this.convertToFinancialRecord(item),
      ),
    );

    const sortedEntities = entities.sort((a, b) => {
      return b.created_at.getTime() - a.created_at.getTime();
    });

    return new PageDto(sortedEntities, pageMetaDto);
  }

  async getFinanceOverviewByProperty(
    propertyId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder = this.financeRepository.createQueryBuilder('finance');
    let query = await this.configFinanceRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.financeRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'finance',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.financeRepository.metadata,
      query,
    );
    query = query.andWhere('property.id = :propertyId', {
      propertyId: propertyId,
    });

    if (startDate) {
      query = query.andWhere('finance.created_at >= :startDate', {
        startDate: startDate,
      });
      query = query.andWhere('finance.created_at <= :endDate', {
        endDate: endDate,
      });
    }

    const entities = await query.getMany();
    const result: PropertyFinanceOverview[] = [];
    const resultMap = entities.map(async (item) => {
      const ledgers = await (
        await this.getLedgersByProperty(item.property.id, {})
      ).data;
      result.push({
        finance: item,
        ledgers: ledgers,
      });
    });
    await Promise.all(resultMap);
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(result, pageMetaDto);
  }

  async getAllPaymentRequest(pageOptionsDto: PageOptionsDto) {
    const queryBuilder =
      this.paymentRequestRepository.createQueryBuilder('payment_request');
    let query = await this.configPaymentRequestRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.paymentRequestRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'payment_request',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.paymentRequestRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async calculateTotalRevenuesAndCosts(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    propertyId = 0,
  ): Promise<{ revenues: number; costs: number }> {
    let financeRevenuesQuery = this.financeRepository
      .createQueryBuilder('finance')
      .select('SUM(finance.amount)', 'total')
      .innerJoin('finance.tenant', 'tenant')
      .innerJoin('finance.agreement', 'agreement')
      .innerJoin('agreement.property', 'property')
      .where('finance.created_at >= :startDate', {
        startDate: startDate.toDate(),
      })
      .andWhere('finance.created_at <= :endDate', { endDate: endDate.toDate() })
      .andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    if (propertyId) {
      financeRevenuesQuery = financeRevenuesQuery.andWhere(
        'property.id = :propertyId',
        {
          propertyId: propertyId,
        },
      );
    }

    const financeRevenues = await financeRevenuesQuery.getRawOne();

    let ledgerRevenuesQuery = await this.ledgerRepository
      .createQueryBuilder('ledger')
      .select(
        'SUM(CASE WHEN ledger.kind = :revenues THEN ledger.amount ELSE 0 END)',
        'total',
      )
      .innerJoin('ledger.tenant', 'tenant')
      .innerJoin('ledger.property', 'property')
      .where('ledger.created_at >= :startDate', {
        startDate: startDate.toDate(),
      })
      .andWhere('ledger.created_at <= :endDate', { endDate: endDate.toDate() })
      .andWhere('tenant.id = :tenantId', { tenantId: tenantId })
      .setParameters({ revenues: 'Revenues' });

    if (propertyId) {
      ledgerRevenuesQuery = ledgerRevenuesQuery.andWhere(
        'property.id = :propertyId',
        {
          propertyId: propertyId,
        },
      );
    }

    const ledgerRevenues = await ledgerRevenuesQuery.getRawOne();

    let ledgerCostsQuery = await this.ledgerRepository
      .createQueryBuilder('ledger')
      .select(
        'SUM(CASE WHEN ledger.kind = :costs THEN ledger.amount ELSE 0 END)',
        'total',
      )
      .innerJoin('ledger.tenant', 'tenant')
      .innerJoin('ledger.property', 'property')
      .where('ledger.created_at >= :startDate', {
        startDate: startDate.toDate(),
      })
      .andWhere('ledger.created_at <= :endDate', { endDate: endDate.toDate() })
      .andWhere('tenant.id = :tenantId', { tenantId: tenantId })
      .setParameters({ costs: 'Cost' });

    if (propertyId) {
      ledgerCostsQuery = ledgerCostsQuery.andWhere(
        'property.id = :propertyId',
        {
          propertyId: propertyId,
        },
      );
    }

    const ledgerCosts = await ledgerCostsQuery.getRawOne();

    const totalRevenues =
      (financeRevenues.total ? parseFloat(financeRevenues.total) : 0) +
      (ledgerRevenues.total ? parseFloat(ledgerRevenues.total) : 0);
    const totalCosts = ledgerCosts ? parseFloat(ledgerCosts.total) : 0;

    return {
      revenues: totalRevenues,
      costs: totalCosts,
    };
  }

  async getPaymentRequestByTenant(
    tenantId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder =
      this.paymentRequestRepository.createQueryBuilder('payment_request');
    let query = await this.configPaymentRequestRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.paymentRequestRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'payment_request',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.paymentRequestRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async configLedgerRelative(queryBuilder: SelectQueryBuilder<Ledger>) {
    const query = await queryBuilder
      .leftJoinAndSelect('ledger.tenant', 'tenant')
      .leftJoinAndSelect('ledger.property', 'property');
    return query;
  }

  async getLedgersByProperty(
    propertyId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder = this.ledgerRepository.createQueryBuilder('ledger');
    let query = await this.configLedgerRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.ledgerRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'ledger',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.ledgerRepository.metadata,
      query,
    );
    query = query.andWhere('property.id = :propertyId', {
      propertyId: propertyId,
    });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getAllLedgers(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.ledgerRepository.createQueryBuilder('ledger');
    let query = await this.configLedgerRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.ledgerRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'ledger',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.ledgerRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getLedgersByTenant(tenantId: number, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.ledgerRepository.createQueryBuilder('ledger');
    let query = await this.configLedgerRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.ledgerRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'ledger',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.ledgerRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async removePaymentRequestById(id: number) {
    await this.paymentRequestRepository.delete(id);
    return 'Payment Request was deleted.';
  }

  async removeLedgerById(id: number) {
    await this.ledgerRepository.delete(id);
    return 'Ledger was deleted.';
  }

  async updatePaymentStatus(result: NotificationTransactionResponse) {
    const externalId = result.metadata.find(
      (m) => m.key === 'external_id',
    )?.value;
    if (!externalId) {
      throw new BadRequestException('Invalid External Id');
    }
    const finance = await this.financeRepository.findOne({
      where: {
        id: parseInt(externalId),
      },
    });
    if (!finance) {
      throw new BadGatewayException('Invalid Finance');
    }
    if ((result.status as string) === 'completed') {
      finance.paidAt = new Date();
    }
    finance.status = `opp_${result.status}` as PaymentStatus;
    if (result.payment_method) finance.paymentMethod = result.payment_method;

    await this.financeRepository.save(finance);
  }

  async getOverViewPaymentByTenant(
    tenantId: number,
    duration: string,
    param: string,
  ) {
    const startDate: moment.Moment = null;
    const endDate: moment.Moment = null;

    if (!startDate || !endDate) {
      throw new BadRequestException(
        i18nValidationMessage('message.InvalidParams'),
      );
    }
    if (!startDate.isValid() || !endDate.isValid()) {
      throw new BadRequestException(
        i18nValidationMessage('message.InvalidParams'),
      );
    }

    const revenues = await this.agreementService.getTotalIncomeByDuration(
      tenantId,
      startDate,
      endDate,
    );
    const costs = await this.agreementService.getTotalExpenseByDuratioin(
      tenantId,
      startDate,
      endDate,
    );
    const effeciency = revenues - costs;
    return {
      revenues,
      costs,
      effeciency,
    };
  }

  async getOverViewByTenant(tenantId: number, duration: string, param: string) {
    const { startDate, endDate } = getStartAndEndDate(duration, param);
    if (!startDate || !endDate) {
      throw new BadRequestException(
        i18nValidationMessage('message.InvalidParams'),
      );
    }
    if (!startDate.isValid() || !endDate.isValid()) {
      throw new BadRequestException(
        i18nValidationMessage('message.InvalidParams'),
      );
    }

    const revenues = await this.agreementService.getTotalIncomeByDuration(
      tenantId,
      startDate,
      endDate,
    );
    const costs = await this.agreementService.getTotalExpenseByDuratioin(
      tenantId,
      startDate,
      endDate,
    );
    const effeciency = revenues - costs;
    return {
      revenues,
      costs,
      effeciency,
    };
  }

  async getLedgerByPropertyId(id: number) {
    return this.ledgerRepository.find({
      where: { property: { id: id } },
    });
  }

  async getOverViewByProperty(
    propertyId: number,
    duration: string,
    param: string,
  ) {
    const { startDate, endDate } = getStartAndEndDate(duration, param);

    if (
      (startDate && !startDate.isValid()) ||
      (endDate && !endDate.isValid())
    ) {
      throw new BadRequestException(
        i18nValidationMessage('message.InvalidParams'),
      );
    }

    const revenues =
      await this.agreementService.getTotalIncomeByPropertyDuration(
        propertyId,
        startDate,
        endDate,
      );
    const costs =
      await this.agreementService.getTotalExpenseByPropertyDuratioin(
        propertyId,
        startDate,
        endDate,
      );
    const effeciency = revenues - costs;
    return {
      revenues,
      costs,
      effeciency,
    };
  }

  async updateMortgageInterests(mortgageLine: MortgageLine) {
    let mortgageDetails: MortgageDetails;

    if (mortgageLine.type === 'Annuity') {
      mortgageDetails = calculateAnnuityMortgageDetails(
        mortgageLine.amount,
        mortgageLine.interestRate,
        mortgageLine.startDate,
        mortgageLine.endDate,
      );
    } else if (mortgageLine.type === 'Linear') {
      mortgageDetails = calculateLinearMortgageDetails(
        mortgageLine.amount,
        mortgageLine.interestRate,
        mortgageLine.startDate,
        mortgageLine.endDate,
      );
    } else {
      this.logger.warn('Unknown mortgage type');
      return;
    }

    if (
      new Date() < mortgageLine.startDate ||
      new Date() > mortgageLine.endDate
    ) {
      return;
    }

    mortgageLine.monthlyPayment = mortgageDetails.monthlyPayment;
    mortgageLine.accumulatedAmount = mortgageDetails.remainingAmount;

    await this.mortgageLineRepository.save(mortgageLine);

    const thirdPartyReference = generateThirdPartyReference(mortgageLine.id);

    const ledger = await this.ledgerRepository.findOne({
      where: {
        thirdPartyReference: thirdPartyReference,
      },
    });

    if (!ledger) {
      const newLedger = new Ledger();
      newLedger.property = mortgageLine.property;
      newLedger.tenant = mortgageLine.property.tenant;
      newLedger.duration = Duration.OneTime;
      newLedger.description = `Hypotheek Rente - Maand ${mortgageDetails.month}/${mortgageLine.duration} - Deel ${mortgageLine.part}`;
      newLedger.kind = Kind.COST;
      newLedger.mortgageType = mortgageLine.type;
      newLedger.amount = mortgageDetails.interestPayment;
      newLedger.startDate = new Date();
      newLedger.endDate = new Date();
      newLedger.thirdPartyReference = thirdPartyReference;

      await this.ledgerRepository.save(newLedger);
    }
  }

  async updateAllMortgageInterests() {
    const queryRunner =
      this.mortgageLineRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      //TODO; Refactor to redis
      const mortgageLines = await this.mortgageLineRepository.find({
        relations: ['property'],
      });

      for (const mortgageLine of mortgageLines) {
        await this.updateMortgageInterests(mortgageLine);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.warn(error);
      console.log('rolling back...');
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTaxCodes() {
    return this.taxRepository.find();
  }
}

function generateThirdPartyReference(mortgageLineId: number): string {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  return `mortgage_id:${mortgageLineId.toString()}-period:${currentMonth}-${currentYear}`;
}
