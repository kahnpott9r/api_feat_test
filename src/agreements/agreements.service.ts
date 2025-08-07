import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Tenant } from '../tenants/entities/tenant.entity';
import { Property } from '../properties/entities/property.entity';
import { Agreement, AgreementStatus } from './entities/agreement.entity';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { Renter } from '../renters/entities/renters.entity';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import {
  LOGISTICAL_TYPE,
  LogisticalItem,
} from '../logistical_items/entities/logistical_item.entity';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';
import { PageOptionsDto } from 'src/pagination/dtos';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { PageDto } from 'src/pagination/page.dto';
import { configQuery, getPaginationKeys, DURATION } from 'src/Utils/utils';
import * as moment from 'moment';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Finance } from 'src/finance/entites/finance.entity';

export interface AgreementPaymentInfo {
  amount: number;
  logisticalItems: LogisticalItem[];
}

@Injectable()
export class AgreementsService {
  private readonly logger = new Logger(AgreementsService.name);
  constructor(
    @InjectRepository(Agreement)
    private agreementRepository: Repository<Agreement>,
    @InjectRepository(LogisticalItem)
    private logisticalItemRepository: Repository<LogisticalItem>,
    @InjectRepository(Renter) private renterRepository: Repository<Renter>,
    @InjectRepository(TaxCode) private taxCodeRepository: Repository<TaxCode>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    tenant: Tenant,
    property: Property,
    renters: Renter[],
    createDto: CreateAgreementDto,
  ) {
    const renterItems = createDto.items.filter(
      (item) => item.type === LOGISTICAL_TYPE.RENT,
    );
    const serviceFeeItems = createDto.items.filter(
      (item) => item.type === LOGISTICAL_TYPE.SERVICE_FEE,
    );
    const depositeItems = createDto.items.filter(
      (item) => item.type === LOGISTICAL_TYPE.DEPOSIT,
    );
    this.validation(renterItems, serviceFeeItems, depositeItems);

    const primaryRenter = await this.renterRepository.findOne({
      where: {
        id: createDto.primaryRenterId,
      },
    });

    if (!primaryRenter) {
      throw new BadRequestException(
        i18nValidationMessage('message.MustPrimaryRenter'),
      );
    }

    // Use transaction to ensure subscriber only fires after everything is saved
    const queryRunner = this.agreementRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const agreement = new Agreement();
      agreement.payment_method = createDto.payment_method;
      agreement.property = property;
      agreement.renters = renters;
      agreement.tenant = tenant;
      agreement.primaryRenter = primaryRenter;
      agreement.paymentDate = createDto.paymentDate;
      agreement.startDate = createDto.startDate;
      agreement.endDate = createDto.endDate;
      
      // Save agreement within transaction
      const savedAgreement = await queryRunner.manager.save(agreement);
      
      // Create all logistical items within the same transaction
      const logisticalItems = createDto.items.map(async (item) => {
        const tax_code = await this.taxCodeRepository.findOne({
          where: { id: item.taxCodeId },
        });
        const logisticalItem = this.logisticalItemRepository.create({
          renters,
          agreement: savedAgreement,
          tenant,
          tax_code,
          ...item,
        });
        await queryRunner.manager.save(logisticalItem);
      });
      await Promise.all(logisticalItems);
      
      // Commit transaction - subscriber will fire now with complete data
      await queryRunner.commitTransaction();
      
      // Manually emit the event after transaction is committed to ensure all data is available
      this.eventEmitter.emit('agreement.insert', savedAgreement);
      
      return savedAgreement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async configRelative(queryBuilder: SelectQueryBuilder<Agreement>) {
    return queryBuilder
      .leftJoinAndSelect('agreements.tenant', 'tenant')
      .leftJoinAndSelect('agreements.property', 'property')
      .leftJoinAndSelect('agreements.renters', 'renter')
      .leftJoinAndSelect('agreements.primaryRenter', 'primaryRenter')
      .leftJoinAndSelect('agreements.logistical_items', 'logistical_item')
      .leftJoinAndSelect('logistical_item.tax_code', 'tax_code')
      .leftJoinAndSelect('property.ledgers', 'ledger');
  }

  async getConsumerAgreements() {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    const query = await this.configRelative(queryBuilder);
    // query = query.andWhere('tenant.type = :type', {
    //   type: TENANT_TYPE.CONSUMER,
    // });
    return await query.getMany();
  }

  async getAllAgreements(pageOptionsDto: PageOptionsDto) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.agreementRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getAgreementsByPaymentDay(paymentDay: number) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);
    query = query.andWhere('agreements.paymentDate = :paymentDate', {
      paymentDate: paymentDay,
    });

    const entities = await query.getMany();
    return entities;
  }

  async getAgreementsByTenant(
    tenantId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.agreementRepository.metadata,
      query,
    );

    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getAgreementsOverviewByTenant(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      {},
      this.agreementRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    if (startDate) {
      query = query.andWhere('agreements.created_at >= :startDate', {
        startDate: startDate,
      });
      query = query.andWhere('agreements.created_at <= :endDate', {
        endDate: endDate,
      });
    }

    const entities = await query.getMany();
    return entities;
  }

  async getRecentAgreementsByTenant(tenantId: number, duration: string) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      {},
      this.agreementRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    if (duration == DURATION.Today) {
      query = query.andWhere('agreements.created_at >= :today', {
        today: moment().add(-1, 'day').endOf('day'),
      });
    } else if (duration == DURATION.Week) {
      query = query.andWhere('agreements.created_at >= :today', {
        today: moment().add(-7, 'day').endOf('day'),
      });
    } else if (duration == DURATION.Month) {
      query = query.andWhere('agreements.created_at >= :today', {
        today: moment().add(-30, 'day').endOf('day'),
      });
    }

    const entities = await query.getMany();
    return entities;
  }

  async getAgreementsByTenantAndDuration(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      {},
      this.agreementRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    if (startDate) {
      query = query.andWhere('agreements.created_at >= :startDate', {
        startDate: startDate,
      });
      query = query.andWhere('agreements.created_at <= :endDate', {
        endDate: endDate,
      });
    }

    const entities = await query.getMany();
    return entities;
  }

  async getAgreementsByPropertyAndDuration(
    propertyId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      {},
      this.agreementRepository.metadata,
      query,
    );
    query = query.andWhere('property.id = :propertyId', {
      propertyId: propertyId,
    });

    if (startDate) {
      query = query.andWhere('agreements.created_at >= :startDate', {
        startDate: startDate,
      });
      query = query.andWhere('agreements.created_at <= :endDate', {
        endDate: endDate,
      });
    }

    return await query.getMany();
  }

  async getAgreementsByTenantWithSum(
    tenantId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreement');
    let query = queryBuilder
      .leftJoin('agreement.renters', 'renters')
      .leftJoin('agreement.property', 'property')
      .leftJoin('agreement.tenant', 'tenant')
      .leftJoin('agreement.primaryRenter', 'primaryRenter')
      .leftJoin(
        'agreement.finances',
        'finance',
        'finance.created_at = (SELECT MAX(f.created_at) FROM finance f WHERE f.agreement_id = agreement.id)',
      );

    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    // <a href="#">{{ record?.street }} {{ record?.house_number }}{{ record?.extension }} {{
    //   record?.city
    // }} ({{ record?.title }})</a>
    query = query.select([
      'agreement.id as id',
      'finance.id as finance_id',
      'finance.status as finance_status',
      'finance.paid_at as paid_at',
      'finance.created_at as finance_at',
      'property.street as street',
      'property.house_number as house_number',
      'property.extension as extension',
      'property.city as city',
      'property.country as country',
      'property.zip_code as zip_code',
    ]);

    const itemCount = await queryBuilder.getCount();

    const entities = await query.getRawMany();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getAgreementsOverviewByProperty(
    propertyId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      {},
      this.agreementRepository.metadata,
      query,
    );
    query = query.andWhere('property.id = :propertyId', {
      propertyId: propertyId,
    });
    if (startDate) {
      query = query.andWhere('agreements.created_at >= :startDate', {
        startDate: startDate,
      });
      query = query.andWhere('agreements.created_at <= :endDate', {
        endDate: endDate,
      });
    }

    const entities = await query.getMany();
    return entities;
  }

  async getAgreementsByProperty(
    property: Property,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );
    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.agreementRepository.metadata,
      query,
    );

    query = query.andWhere('property.id = :propertyId', {
      propertyId: property.id,
    });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getAgreementsByRenter(renter: Renter, pageOptionsDto: PageOptionsDto) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );
    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.agreementRepository.metadata,
      query,
    );

    query = query.andWhere('renter.id = :renterId', { renterId: renter.id });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getAgreementById(agreement: Agreement, id: number) {
    return await this.agreementRepository.find({
      where: {
        id: id,
      },
      relations: [
        'logistical_items',
        'renters',
        'primaryRenter',
        'property',
        'tenant',
        'logistical_items.tax_code',
      ],
    });
  }

  async endAgreementById(agreement: Agreement, id: number) {
    agreement.endedDate = new Date();
    agreement.status = AgreementStatus.Inactive;
    await this.agreementRepository.save(agreement);
    return this.getAgreementById(agreement, id);
  }

  async getAgreementsRelational(id: number) {
    return await this.agreementRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'logistical_items',
        'renters',
        'primaryRenter',
        'property',
        'property.ledgers',
        'tenant',
        'logistical_items.tax_code',
      ],
    });
  }

  async removeAgreementById(agreement: Agreement, id: number) {
    //
    // const properties: Property[] = await Property.createQueryBuilder('property')
    //   .leftJoinAndSelect('property.agreements', 'agreement')
    //   .where('agreement.id = :agreementId', { agreementId: id })
    //   .getMany();
    //
    // const savepropertiesMap = properties.map(async (property) => {
    //   property.agreements = property.agreements.filter((item) => item.id != id);
    //   await Property.save(property);
    // });
    // await Promise.all(savepropertiesMap);
    //
    // const renters: Renter[] = await Renter.createQueryBuilder('renter')
    //   .leftJoinAndSelect('renter.agreements', 'agreement')
    //   .where('agreement.id = :agreementId', { agreementId: id })
    //   .getMany();
    //
    // const saveRentersMap = renters.map(async (renter) => {
    //   renter.agreements = renter.agreements.filter((item) => item.id != id);
    //   await Renter.save(renter);
    // });
    // await Promise.all(saveRentersMap);
    //

    //
    // await LogisticalItem.delete({
    //   agreement: { id },
    // });

    await LogisticalItem.delete({
      agreement: {
        id,
      },
    });
    await Finance.delete({
      agreement: { id },
    });
    await this.agreementRepository.delete(id);
    return 'Agreement was deleted.';
  }

  async updateAgreementById(
    agreement: Agreement,
    property: Property,
    renters: Renter[],
    id: number,
    updateDto: UpdateAgreementDto,
  ) {
    const renterItems = updateDto.items.filter(
      (item) => item.type === LOGISTICAL_TYPE.RENT,
    );
    const serviceFeeItems = updateDto.items.filter(
      (item) => item.type === LOGISTICAL_TYPE.SERVICE_FEE,
    );
    const depositeItems = updateDto.items.filter(
      (item) => item.type === LOGISTICAL_TYPE.DEPOSIT,
    );
    this.validation(renterItems, serviceFeeItems, depositeItems);

    const primaryRenter = await this.renterRepository.findOne({
      where: {
        id: updateDto.primaryRenterId,
      },
    });
    agreement.property = property;
    agreement.renters = renters;
    agreement.primaryRenter = primaryRenter;
    agreement.paymentDate = updateDto.paymentDate;
    agreement.endDate = updateDto.endDate;
    agreement.startDate = updateDto.startDate;

    await this.agreementRepository.save(agreement);
    await this.agreementRepository.update(id, {
      payment_method: updateDto.payment_method,
    });
    await LogisticalItem.delete({
      agreement: {
        id,
      },
    });
    const logisticalItems = updateDto.items.map(async (item) => {
      const tax_code = await this.taxCodeRepository.findOne({
        where: { id: item.taxCodeId },
      });
      const logisticalItem = await this.logisticalItemRepository.create({
        renters,
        agreement,
        tenant: agreement.tenant,
        tax_code,
        ...item,
      });
      await this.logisticalItemRepository.save(logisticalItem);
    });
    await Promise.all(logisticalItems);
    return 'Agreement was updated';
  }

  validation(
    renterItems: object[],
    serviceFeeItems: object[],
    depositeItems: object[],
  ) {
    if (renterItems.length == 0) {
      throw new BadRequestException(
        i18nValidationMessage('message.MustRenter'),
      );
    }
    if (renterItems.length > 1) {
      throw new BadRequestException(
        i18nValidationMessage('message.CantMoreRenter'),
      );
    }
    if (serviceFeeItems.length > 1) {
      throw new BadRequestException(
        i18nValidationMessage('message.CantServiceFee'),
      );
    }
    if (depositeItems.length > 1) {
      throw new BadRequestException(
        i18nValidationMessage('message.CantDepositFee'),
      );
    }
  }

  async getTotalIncome(tenantId: number, duration: string) {
    const agreements = await this.getRecentAgreementsByTenant(
      tenantId,
      duration,
    );
    let totalIncome = 0;
    console.log(totalIncome + 5);
    agreements.forEach((item) => {
      item.logistical_items.forEach((logisticalItem) => {
        totalIncome = totalIncome + parseFloat(`${logisticalItem.amount}`);
      });
    });
    console.log(totalIncome);
    return totalIncome;
  }

  async getTotalExpense(tenantId: number, duration: string) {
    const agreements = await this.getRecentAgreementsByTenant(
      tenantId,
      duration,
    );
    let totalExpose = 0;
    agreements.forEach((item) => {
      item.property.ledgers.forEach((ledger) => {
        totalExpose = totalExpose + parseFloat(`${ledger.amount}`);
      });
    });
    return totalExpose;
  }

  async getTotalIncomeByDuration(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) {
    const agreements = await this.getAgreementsByTenantAndDuration(
      tenantId,
      startDate,
      endDate,
    );
    let totalIncome = 0;
    console.log(totalIncome + 5);
    agreements.forEach((item) => {
      item.logistical_items.forEach((logisticalItem) => {
        totalIncome = totalIncome + parseFloat(`${logisticalItem.amount}`);
      });
    });
    console.log(totalIncome);
    return totalIncome;
  }

  async getTotalExpenseByDuratioin(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) {
    const agreements = await this.getAgreementsByTenantAndDuration(
      tenantId,
      startDate,
      endDate,
    );
    let totalExpose = 0;
    agreements.forEach((item) => {
      item.property.ledgers.forEach((ledger) => {
        totalExpose = totalExpose + parseFloat(`${ledger.amount}`);
      });
    });
    return totalExpose;
  }

  async getTotalIncomeByPropertyDuration(
    propertyId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) {
    const agreements = await this.getAgreementsByPropertyAndDuration(
      propertyId,
      startDate,
      endDate,
    );
    let totalIncome = 0;
    console.log(totalIncome + 5);
    agreements.forEach((item) => {
      item.logistical_items.forEach((logisticalItem) => {
        totalIncome = totalIncome + parseFloat(`${logisticalItem.amount}`);
      });
    });
    console.log(totalIncome);
    return totalIncome;
  }

  async getTotalExpenseByPropertyDuratioin(
    propertyId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) {
    const agreements = await this.getAgreementsByPropertyAndDuration(
      propertyId,
      startDate,
      endDate,
    );
    let totalExpose = 0;
    agreements.forEach((item) => {
      item.property.ledgers.forEach((ledger) => {
        totalExpose = totalExpose + parseFloat(`${ledger.amount}`);
      });
    });
    return totalExpose;
  }

  async getAgreementPropertyCountByTenant(tenantId: number) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    const query = await queryBuilder
      .leftJoinAndSelect('agreements.tenant', 'tenant')
      .leftJoinAndSelect('agreements.property', 'property')
      .where('tenant.id = :tenantId', { tenantId: tenantId })
      .andWhere('agreements.status = :status', {
        status: AgreementStatus.Active,
      });
    return await query
      .select('COUNT(DISTINCT property.id)', 'count')
      .getRawOne()
      .then((result) => result.count || 0);
  }

  getAgreementPaymentInfo(
    agreement: Agreement,
    hasRecentFinance: boolean,
  ): AgreementPaymentInfo {
    const filteredItems = agreement.logistical_items.filter(
      (item: LogisticalItem) => {
        return !hasRecentFinance || item.type !== LOGISTICAL_TYPE.DEPOSIT;
      },
    ) as LogisticalItem[];

    const amount = filteredItems.reduce(
      (total: number, item: LogisticalItem) => {
        const itemAmount = item.amount * (1 + item.tax_code.percentage / 100);
        return total + itemAmount;
      },
      0,
    );

    return {
      amount,
      logisticalItems: filteredItems,
    };
  }

  async getUpcomingExpiringAgreements(tenantId: number) {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreements');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys({});
    const entityFields = this.agreementRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'agreements',
      pageDtoKeys,
      entityFields,
      {},
      this.agreementRepository.metadata,
      query,
    );

    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    query = query.andWhere('agreements.endDate IS NOT NULL'); // Exclude agreements without end date
    query = query.orderBy('agreements.endDate', 'DESC');
    return await query.limit(6).getMany();
  }

  async getActiveAgreementCountByTenant(tenantId: number): Promise<number> {
    const queryBuilder =
      this.agreementRepository.createQueryBuilder('agreement');
    return await queryBuilder
      .innerJoin('agreement.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId })
      .andWhere('agreement.status = :status', {
        status: AgreementStatus.Active,
      })
      .getCount();
  }
}
