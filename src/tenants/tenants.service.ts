import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository, SelectQueryBuilder } from 'typeorm';
import * as moment from 'moment';
import { Tenant } from './entities/tenant.entity';
import { Property } from '../properties/entities/property.entity';
import { EarnEProperty } from '../earn-e/entities/earn-e-property.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PageOptionsDto } from '../pagination/dtos';
import { PropertiesService } from '../properties/properties.service';
import { EmailService } from '../Utils/EmailService';
import { ConfigService } from '@nestjs/config';
import { configQuery, getPaginationKeys } from 'src/Utils/utils';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { PageDto } from 'src/pagination/page.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(EarnEProperty)
    private earnEPropertyRepository: Repository<EarnEProperty>,
    private readonly propertiesService: PropertiesService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  create(createTenantDto: CreateTenantDto) {
    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async configRelative(queryBuilder: SelectQueryBuilder<Tenant>) {
    const query = await queryBuilder
      .leftJoinAndSelect('tenant.user_roles', 'user_role')
      .leftJoinAndSelect('user_role.user', 'user');
    return query;
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.tenantRepository.createQueryBuilder('tenant');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.tenantRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'tenant',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.tenantRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  findOne(id: number) {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async update(id: number, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: number) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return this.tenantRepository.remove(tenant);
  }

  private async getEarnEPropertiesByTenantId(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ): Promise<Property[]> {
    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.earnEProperties', 'earnEProperty')
      .where('property.tenant.id = :tenantId', { tenantId })
      .andWhere('property.pairingCode IS NOT NULL')
      .andWhere('earnEProperty.deviceId = property.pairingCode')
      .andWhere('earnEProperty.timestamp BETWEEN :startDate AND :endDate', {
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      })
      .getMany();

    return properties;
  }

  async activateEarnE(tenantId: number, propertyIds: number[]) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!propertyIds || propertyIds.length === 0) {
      throw new BadRequestException('No property IDs provided');
    }

    const properties = await this.propertyRepository.find({
      where: {
        id: In(propertyIds),
        tenant: { id: tenantId },
      },
    });

    if (properties.length !== propertyIds.length) {
      throw new BadRequestException(
        'Some property IDs are invalid or do not belong to this tenant',
      );
    }

    const activatedProperties = [];
    for (const property of properties) {
      if (!property.hasEarnE) {
        property.hasEarnE = true;
        activatedProperties.push(property);
      }
    }

    await this.propertyRepository.save(properties);

    if (activatedProperties.length > 0) {
      tenant.hasEarnE = true;
      await this.tenantRepository.save(tenant);

      // Send email notification
      const emailSent = await this.sendEarnEActivationEmail(
        tenant,
        activatedProperties,
      );
      if (!emailSent) {
        console.error(
          'Failed to send EnergyLinqs activation email to all recipients',
        );
      }
    }

    return {
      message:
        'EnergyLinqs activated successfully for the specified properties',
      activatedProperties: activatedProperties.map((p) => p.id),
    };
  }

  private async sendEarnEActivationEmail(
    tenant: Tenant,
    activatedProperties: Property[],
  ) {
    const staticEmail = 'info@propertylinqs.com';
    const tenantEmail = tenant.email;
    const recipients = [staticEmail, tenantEmail];
    const subject = 'Energie module geactiveerd';
    const text = 'De energie module is geactiveerd voor de volgende objecten:';

    const donglePrice = 29.95; // Price per dongle ex BTW
    const totalCost = activatedProperties.length * donglePrice;

    const data = {
      tenant_name: tenant.name,
      properties: activatedProperties.map((p) => `${p.id}`).join(', '),
      activation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      dongle_count: activatedProperties.length,
      dongle_price: donglePrice.toFixed(2),
      total_cost: totalCost.toFixed(2),
    };

    const templateId = this.configService.get(
      'SEND_GRID_EARN_E_ACTIVATION_TEMPLATE',
    );

    let hasSendOne = false;

    for (const to of recipients) {
      const sent = await this.emailService.sendEmail(
        to,
        subject,
        text,
        data,
        templateId,
      );

      if (sent) {
        hasSendOne = true;
        console.log(`EarnE activation email sent successfully to ${to}`);
      } else {
        console.error(`Failed to send EarnE activation email to ${to}`);
      }
    }

    // // For testing purposes, let's also log the email content
    // console.log('Email Content:');
    // console.log(`To: ${recipients.join(', ')}`);
    // console.log(`Subject: ${subject}`);
    // console.log(`Text: ${text}`);
    // console.log('Data:', JSON.stringify(data, null, 2));

    // Return true if at least one email was sent successfully
    return hasSendOne;
  }

  async getAggregatedEarnEDataByTenantId(
    tenantId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    interval: string,
  ): Promise<{ properties: PropertyData[]; total: TotalPropertyData }> {
    const properties = await this.getEarnEPropertiesByTenantId(
      tenantId,
      startDate,
      endDate,
    );
    const dateFormat = this.dateFormats[interval];

    const propertyDataArray = properties.map((property) =>
      this.aggregatePropertyData(
        property,
        startDate,
        endDate,
        interval,
        dateFormat,
      ),
    );
    const total = this.calculateTotalData(
      propertyDataArray,
      startDate,
      endDate,
      interval,
    );

    return {
      properties: propertyDataArray,
      total: total,
    };
  }

  private aggregatePropertyData(
    property: Property,
    startDate: moment.Moment,
    endDate: moment.Moment,
    interval: string,
    dateFormat: string,
  ): PropertyData {
    const { unit, count } = this.intervalDurationMapping[interval];
    const periodCount = this.getPeriodCount(interval, startDate, endDate);

    const intervalData = this.calculateIntervalData(
      property,
      startDate,
      endDate,
      interval,
      dateFormat,
    );
    const periodData = this.calculatePeriodData(
      property,
      startDate,
      endDate,
      interval,
      unit,
      count,
      periodCount,
      dateFormat,
    );

    return {
      property,
      interval: intervalData,
      period: periodData,
    };
  }

  private calculateTotalData(
    propertyDataArray: PropertyData[],
    startDate: moment.Moment,
    endDate: moment.Moment,
    interval: string,
  ): TotalPropertyData {
    const emptyIntervalData: EnergyDataInterval = {
      date: startDate.format(this.intervalDateFormats[interval]),
      energyDeliveredTotal: 0,
      energyReturnedTotal: 0,
      gasDeliveredTotal: 0,
      energyCostsTotal: 0,
      gasCostsTotal: 0,
      energyCosts: 0,
      gasCosts: 0,
      intervalEnergyDelivered: 0,
      intervalEnergyReturned: 0,
      intervalGasDelivered: 0,
    };

    const totalInterval =
      propertyDataArray.length > 0
        ? this.sumIntervalData(propertyDataArray.map((pd) => pd.interval))
        : emptyIntervalData;

    const periodCount = this.getPeriodCount(interval, startDate, endDate);
    const emptyPeriodData: EnergyDataPeriod[] = Array(periodCount)
      .fill(null)
      .map((_, index) => ({
        date: moment(startDate)
          .add(index, this.intervalDurationMapping[interval].unit)
          .format(this.dateFormats[interval]),
        energyDeliveredTotal: 0,
        energyReturnedTotal: 0,
        gasDeliveredTotal: 0,
        energyCostsTotal: 0,
        gasCostsTotal: 0,
        energyCosts: 0,
        gasCosts: 0,
        periodEnergyDelivered: 0,
        periodEnergyReturned: 0,
        periodGasDelivered: 0,
      }));

    const totalPeriod =
      propertyDataArray.length > 0
        ? this.sumPeriodData(propertyDataArray.map((pd) => pd.period))
        : emptyPeriodData;

    return {
      interval: totalInterval,
      period: totalPeriod,
    };
  }

  private sumIntervalData(
    intervalDataArray: EnergyDataInterval[],
  ): EnergyDataInterval {
    return intervalDataArray.reduce((total, current) => ({
      date: current.date,
      energyDeliveredTotal:
        total.energyDeliveredTotal + current.energyDeliveredTotal,
      energyReturnedTotal:
        total.energyReturnedTotal + current.energyReturnedTotal,
      gasDeliveredTotal: total.gasDeliveredTotal + current.gasDeliveredTotal,
      energyCostsTotal: total.energyCostsTotal + current.energyCostsTotal,
      gasCostsTotal: total.gasCostsTotal + current.gasCostsTotal,
      energyCosts: total.energyCosts + current.energyCosts,
      gasCosts: total.gasCosts + current.gasCosts,
      intervalEnergyDelivered:
        total.intervalEnergyDelivered + current.intervalEnergyDelivered,
      intervalEnergyReturned:
        total.intervalEnergyReturned + current.intervalEnergyReturned,
      intervalGasDelivered:
        total.intervalGasDelivered + current.intervalGasDelivered,
    }));
  }

  private sumPeriodData(
    periodDataArrays: EnergyDataPeriod[][],
  ): EnergyDataPeriod[] {
    if (periodDataArrays.length === 0) {
      return [];
    }

    const totalPeriods: EnergyDataPeriod[] = [];

    for (let i = 0; i < periodDataArrays[0].length; i++) {
      totalPeriods.push(
        periodDataArrays.reduce(
          (total, current) => ({
            date: current[i].date,
            energyDeliveredTotal:
              total.energyDeliveredTotal + current[i].energyDeliveredTotal,
            energyReturnedTotal:
              total.energyReturnedTotal + current[i].energyReturnedTotal,
            gasDeliveredTotal:
              total.gasDeliveredTotal + current[i].gasDeliveredTotal,
            energyCostsTotal:
              total.energyCostsTotal + current[i].energyCostsTotal,
            gasCostsTotal: total.gasCostsTotal + current[i].gasCostsTotal,
            energyCosts: total.energyCosts + current[i].energyCosts,
            gasCosts: total.gasCosts + current[i].gasCosts,
            periodEnergyDelivered:
              total.periodEnergyDelivered + current[i].periodEnergyDelivered,
            periodEnergyReturned:
              total.periodEnergyReturned + current[i].periodEnergyReturned,
            periodGasDelivered:
              total.periodGasDelivered + current[i].periodGasDelivered,
          }),
          {
            date: '',
            energyDeliveredTotal: 0,
            energyReturnedTotal: 0,
            gasDeliveredTotal: 0,
            energyCostsTotal: 0,
            gasCostsTotal: 0,
            energyCosts: 0,
            gasCosts: 0,
            periodEnergyDelivered: 0,
            periodEnergyReturned: 0,
            periodGasDelivered: 0,
          } as EnergyDataPeriod,
        ),
      );
    }

    return totalPeriods;
  }

  private calculateIntervalData(
    property: Property,
    startDate: moment.Moment,
    endDate: moment.Moment,
    interval: string,
    dateFormat: string,
  ): EnergyDataInterval {
    const earnEProperties = property.earnEProperties || [];
    const lastEntry =
      earnEProperties.length > 0
        ? earnEProperties[earnEProperties.length - 1]
        : null;

    const intervalEnergyDelivered =
      this.sumDifferences(earnEProperties, 'energyDeliveredTariff1Difference') +
      this.sumDifferences(earnEProperties, 'energyDeliveredTariff2Difference');
    const intervalEnergyReturned =
      this.sumDifferences(earnEProperties, 'energyReturnedTariff1Difference') +
      this.sumDifferences(earnEProperties, 'energyReturnedTariff2Difference');
    const intervalGasDelivered = this.sumDifferences(
      earnEProperties,
      'gasDeliveredDifference',
    );

    return {
      date: startDate.format(this.intervalDateFormats[interval]),
      energyDeliveredTotal: lastEntry
        ? Number(lastEntry.energyDeliveredTariff1) +
          Number(lastEntry.energyDeliveredTariff2)
        : 0,
      energyReturnedTotal: lastEntry
        ? Number(lastEntry.energyReturnedTariff1) +
          Number(lastEntry.energyReturnedTariff2)
        : 0,
      gasDeliveredTotal: lastEntry ? Number(lastEntry.gasDelivered) : 0,
      energyCostsTotal: lastEntry
        ? Number(property.energyCosts || 0) *
          (Number(lastEntry.energyDeliveredTariff1) +
            Number(lastEntry.energyDeliveredTariff2))
        : 0,
      gasCostsTotal: lastEntry
        ? Number(property.gasCosts || 0) * Number(lastEntry.gasDelivered)
        : 0,
      intervalEnergyDelivered: Number(intervalEnergyDelivered),
      intervalEnergyReturned: Number(intervalEnergyReturned),
      intervalGasDelivered: Number(intervalGasDelivered),
      energyCosts: Number(property.energyCosts || 0) * intervalEnergyDelivered,
      gasCosts: Number(property.gasCosts || 0) * intervalGasDelivered,
    };
  }

  private calculatePeriodData(
    property: Property,
    startDate: moment.Moment,
    endDate: moment.Moment,
    interval: string,
    unit: moment.DurationInputArg2,
    count: number,
    periodCount: number,
    dateFormat: string,
  ): EnergyDataPeriod[] {
    const periods: EnergyDataPeriod[] = [];
    let currentDate = startDate.clone();

    for (let i = 0; i < periodCount; i++) {
      const periodEnd = currentDate.clone().add(count, unit);
      const periodEarnEProperties = (property.earnEProperties || []).filter(
        (ep) =>
          moment(ep.timestamp).isBetween(currentDate, periodEnd, null, '[)'),
      );

      const lastEntry =
        periodEarnEProperties.length > 0
          ? periodEarnEProperties[periodEarnEProperties.length - 1]
          : null;

      const periodEnergyDelivered =
        this.sumDifferences(
          periodEarnEProperties,
          'energyDeliveredTariff1Difference',
        ) +
        this.sumDifferences(
          periodEarnEProperties,
          'energyDeliveredTariff2Difference',
        );
      const periodEnergyReturned =
        this.sumDifferences(
          periodEarnEProperties,
          'energyReturnedTariff1Difference',
        ) +
        this.sumDifferences(
          periodEarnEProperties,
          'energyReturnedTariff2Difference',
        );
      const periodGasDelivered = this.sumDifferences(
        periodEarnEProperties,
        'gasDeliveredDifference',
      );

      const energyDeliveredTotal = lastEntry
        ? Number(lastEntry.energyDeliveredTariff1) +
          Number(lastEntry.energyDeliveredTariff2)
        : 0;
      const gasDeliveredTotal = lastEntry ? Number(lastEntry.gasDelivered) : 0;

      periods.push({
        date: currentDate.format(dateFormat),
        energyDeliveredTotal,
        energyReturnedTotal: lastEntry
          ? Number(lastEntry.energyReturnedTariff1) +
            Number(lastEntry.energyReturnedTariff2)
          : 0,
        gasDeliveredTotal,
        energyCostsTotal:
          Number(property.energyCosts || 0) * energyDeliveredTotal,
        gasCostsTotal: Number(property.gasCosts || 0) * gasDeliveredTotal,
        energyCosts: property.energyCosts
          ? Number(periodEnergyDelivered * property.energyCosts)
          : 0,
        gasCosts: property.gasCosts
          ? Number(periodGasDelivered * property.gasCosts)
          : 0,
        periodEnergyDelivered: Number(periodEnergyDelivered),
        periodEnergyReturned: Number(periodEnergyReturned),
        periodGasDelivered: Number(periodGasDelivered),
      });

      currentDate = periodEnd;
    }

    return periods;
  }

  private sumDifferences(
    earnEProperties: EarnEProperty[],
    field: string,
  ): number {
    return earnEProperties.reduce(
      (sum, ep) => Number(sum) + Number(ep[field] || 0),
      0,
    );
  }

  private getPeriodCount(
    interval: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ): number {
    switch (interval) {
      case 'hour':
        return 4;
      case 'day':
        return 24;
      case 'week':
        return 21;
      case 'month':
        return endDate.diff(startDate, 'days') + 1;
      case 'quarter':
        return 3;
      case 'year':
        return 12;
      default:
        throw new Error(`Invalid interval: ${interval}`);
    }
  }

  private intervalDurationMapping: Record<
    string,
    { unit: moment.DurationInputArg2; count: number }
  > = {
    hour: { unit: 'minutes', count: 15 },
    day: { unit: 'hours', count: 1 },
    week: { unit: 'hours', count: 8 },
    month: { unit: 'days', count: 1 },
    quarter: { unit: 'months', count: 1 },
    year: { unit: 'months', count: 1 },
  };

  private dateFormats: Record<string, string> = {
    hour: 'HH:mm',
    day: 'HH:mm DD-MM',
    week: 'HH:mm DD-MM',
    month: 'DD-MM-YYYY',
    quarter: 'MM-YYYY',
    year: 'MM-YYYY',
  };

  private intervalDateFormats: Record<string, string> = {
    day: 'DD-MM-YYYY',
    week: 'WW-YYYY',
    month: 'MM-YYYY',
    quarter: 'Q[Q] YYYY',
    year: 'YYYY',
  };
}

// Interface for the intervals of energy data
export interface EnergyDataInterval {
  date: string; // New field to include the date of the interval (example: 2024-01(if interval is month))
  energyDeliveredTotal: number; // the total energyDelivered at the interval (the last entry of energyDeliveredTariff1 + energyDeliveredTariff2 for this interval)
  energyReturnedTotal: number; // the total energyReturned at the interval (the last entry of energyReturnedTariff1 + energyReturnedTariff2 for this interval)
  gasDeliveredTotal: number; // the total gasDelivered at the interval (the last entry of gasDelivered for this interval)
  energyCostsTotal: number; // energyCostsTotal = property.energyCosts * energyDeliveredTotal
  gasCostsTotal: number; // gasCostsTotal = property.gasCosts * gasDeliveredTotal
  energyCosts: number; // energyCosts = property.energyCosts / intervalEnergyDelivered
  gasCosts: number; // gasCosts = property.gasCosts / intervalGasDelivered
  intervalEnergyDelivered: number; // the Aggregated energyDeliveredTariff1Diff + energyDeliveredTariff2Diff   for the interval
  intervalEnergyReturned: number; // the Aggregated energyReturnedTariff1Diff + energyReturnedTariff2Diff for the interval
  intervalGasDelivered: number; // the Aggregated gasDeliveredDiff for the interval
}

// Interface for the period-based energy data (e.g., daily, monthly totals)
export interface EnergyDataPeriod {
  date: string; // New field to include the date of the period example: 2024-01-01 (if period is day(interval is month))
  energyDeliveredTotal: number; // the total energyDelivered for the period (the last entry of energyDeliveredTariff1 + energyDeliveredTariff2 for this period)
  energyReturnedTotal: number; // the total energyReturned for the period (the last entry of energyReturnedTariff1 + energyReturnedTariff2 for this period)
  gasDeliveredTotal: number; // the total gasDelivered for the period (the last entry of gasDelivered for this period)
  energyCosts: number; // energyCosts = property.energyCosts / periodEnergyDelivered
  gasCosts: number; // gasCosts = property.gasCosts / periodGasDelivered
  energyCostsTotal: number; // energyCostsTotal = property.energyCosts * energyDeliveredTotal
  gasCostsTotal: number; // gasCostsTotal = property.gasCosts * gasDeliveredTotal
  periodEnergyDelivered: number; // the Aggregated energyDeliveredTariff1Diff + energyDeliveredTariff2Diff for the period
  periodEnergyReturned: number; // the Aggregated energyReturnedTariff1Diff + energyReturnedTariff2Diff  for the period
  periodGasDelivered: number; // the Aggregated gasDeliveredDiff for the period
}

// Interface for the aggregated data of a single property (e.g., 1 property, interval is month, period is day)
export interface PropertyData {
  property: Property;
  interval: EnergyDataInterval; // Object with the aggregated interval data
  period: EnergyDataPeriod[]; // Array of periods for the property (e.g. interval is month, so array with 30/31 objects)
}

// Interface for the total aggregated data of all properties
export interface TotalPropertyData {
  interval: EnergyDataInterval; // Object with the aggregated interval data for all properties
  period: EnergyDataPeriod[]; // Array of periods for all properties combined
}
