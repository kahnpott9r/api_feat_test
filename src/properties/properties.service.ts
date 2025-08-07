import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Tenant } from '../tenants/entities/tenant.entity';
import { CreatePropertyTypeDto } from './dto/create-property-type.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyTypeDto } from './dto/update-property-type.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { PropertyType } from './entities/property_type.entity';
import { Agreement } from '../agreements/entities/agreement.entity';
import { Task } from '../tasks/entities/task.entity';
import {
  LOGISTICAL_TYPE,
  LogisticalItem,
} from '../logistical_items/entities/logistical_item.entity';
import { PageOptionsDto } from 'src/pagination/dtos';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { PageDto } from 'src/pagination/page.dto';
import { ATACHMENT_TYPE, PropertyAttachment } from './entities/property-attachments.entity';
import { NoteEntity } from './entities/note.entity';
import { configQuery, getPaginationKeys } from 'src/Utils/utils';
import { UpdatePropertyNoteDto } from './dto/update-property-note.dto';
import { UpdatePropertyAttachmentsDto } from './dto/update-property-attachments.dto';
import { Kind, Ledger } from 'src/finance/entites/ledger.entity';
import { Finance } from 'src/finance/entites/finance.entity';
import {
  MortgageDetails,
  MortgageLine,
  Type,
} from '../mortgage_lines/entities/mortgage-line.entity';
import { UpdatePropertyValueDto } from './dto/update-property-value.dto';
import { CreateMortgageLineDto } from '../mortgage_lines/dto/create-mortgage-line.dto';
import { EnergyInsulation } from './entities/energy-insulation.entity';
import { UpdateEnergyInsulationDto } from './dto/update-energy-insulation.dto';
import { CreateEnergyInsulationDto } from './dto/create-energy-insulation.dto';
import { UpdatePropertyEnergyInformationDto } from './dto/update-property-energy-information.dto';
import { EarnEProperty } from '../earn-e/entities/earn-e-property.entity';
import * as moment from 'moment';

export interface EnergyDataInterval {
  date: string;
  energyDeliveredTotal: number;
  energyReturnedTotal: number;
  gasDeliveredTotal: number;
  energyCostsTotal: number;
  gasCostsTotal: number;
  energyCosts: number;
  gasCosts: number;
  intervalEnergyDelivered: number;
  intervalEnergyReturned: number;
  intervalGasDelivered: number;
}

export interface EnergyDataPeriod {
  date: string;
  energyDeliveredTotal: number;
  energyReturnedTotal: number;
  gasDeliveredTotal: number;
  energyCosts: number;
  gasCosts: number;
  energyCostsTotal: number;
  gasCostsTotal: number;
  periodEnergyDelivered: number;
  periodEnergyReturned: number;
  periodGasDelivered: number;
}

export interface PropertyData {
  property: Property;
  interval: EnergyDataInterval;
  period: EnergyDataPeriod[];
}

export interface TotalPropertyData {
  interval: EnergyDataInterval;
  period: EnergyDataPeriod[];
}

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertyType)
    private typeRepository: Repository<PropertyType>,
    @InjectRepository(PropertyAttachment)
    private attachmentRepository: Repository<PropertyAttachment>,
    @InjectRepository(EnergyInsulation)
    private insulationRepository: Repository<EnergyInsulation>,
    @InjectRepository(NoteEntity)
    private noteRepository: Repository<NoteEntity>,
    @InjectRepository(MortgageLine)
    private mortgageLineRepository: Repository<MortgageLine>,
    @InjectRepository(EarnEProperty)
    private readonly earnEPropertyRepository: Repository<EarnEProperty>,
  ) {}

  async create(tenant: Tenant, createDto: CreatePropertyDto) {
    const type = await this.typeRepository.findOne({
      where: { id: createDto.typeId },
    });

    if (!type) {
      throw new NotFoundException('Type bestaat niet');
    }

    const property = new Property();
    property.description = createDto.description;
    property.street = createDto.street;
    property.house_number = createDto.house_number;
    property.extension = createDto.extension;
    property.city = createDto.city;
    property.zip_code = createDto.zip_code;
    property.country = createDto.country;
    property.size = createDto.size;
    property.plot_size = createDto.plot_size;
    property.bedroom_number = createDto.bedroom_number;
    property.workroom_number = createDto.workroom_number;
    property.rooms_number = createDto.rooms_number;
    property.bathroom_number = createDto.bathroom_number;
    property.year = createDto.year;
    property.energy_level = createDto.energy_level;
    property.energy_heating = createDto.energy_heating;
    property.type = type;
    property.tenant = tenant;

    if (createDto.insulationIds?.length > 0) {
      const insulation = await this.insulationRepository.find({
        where: { id: In(createDto.insulationIds) },
      });

      if (!insulation) {
        throw new NotFoundException('Isolatie bestaat niet');
      } else {
        console.log(insulation);
      }

      property.energy_insulation = insulation;
    }

    await property.save();

    // const energyInsulation = createDto.energy_insulation.map(async (item) => {
    //   const insulation = this.insulationRepository.create({
    //     ...item,
    //   });
    //   await this.insulationRepository.save(insulation);
    // });

    const attachments = createDto.attachments.map(async (item) => {
      const attachment = this.attachmentRepository.create({
        property,
        ...item,
        type: ATACHMENT_TYPE.FILE,
      });
      await this.attachmentRepository.save(attachment);
    });

    const images = createDto.images.map(async (item) => {
      const image = this.attachmentRepository.create({
        property,
        ...item,
        type: ATACHMENT_TYPE.IMAGE,
      });
      await this.attachmentRepository.save(image);
    });

    if (createDto.notes.length > 0) {
      const notes = createDto.notes.map(async (item) => {
        const note = this.noteRepository.create({
          property,
          ...item,
          history: item.history || [
            {
              timestamp: new Date().toISOString(),
              type: 'created',
            },
          ],
        });
        await this.noteRepository.save(note);
      });
      await Promise.all(notes);
    }

    await Promise.all(attachments);
    await Promise.all(images);
    return property;
  }

  async getAllProperties(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.propertyRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    let query = queryBuilder
      .leftJoinAndSelect('property.agreements', 'agreement')
      .leftJoinAndSelect('property.type', 'property_type')
      .leftJoinAndSelect('property.energy_insulation', 'energy_insulation')
      .leftJoinAndSelect('property.tasks', 'task')
      .leftJoinAndSelect('property.attachments', 'attachment')
      .leftJoinAndSelect('property.notes', 'note_entity')
      .leftJoinAndSelect('agreement.renters', 'renters');

    query = configQuery(
      'property',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.propertyRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getPropertiesByTenant(
    tenantId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');
    let query = queryBuilder
      .leftJoinAndSelect('property.tenant', 'tenant')
      .leftJoinAndSelect('property.agreements', 'agreement')
      .leftJoinAndSelect('property.type', 'property_type')
      .leftJoinAndSelect('property.energy_insulation', 'energy_insulation')
      .leftJoinAndSelect('property.attachments', 'attachment')
      .leftJoinAndSelect('property.tasks', 'task')
      .leftJoinAndSelect('property.notes', 'note_entity')
      .leftJoinAndSelect('agreement.renters', 'renters');

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.propertyRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'property',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.propertyRepository.metadata,
      query,
      true,
    );

    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
      allowUnpaginated: true,
    });
    return new PageDto(entities, pageMetaDto);
  }

  async getPropertiesByTenantWithSum(
    tenantId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');
    let query = queryBuilder
      .leftJoinAndSelect('property.ledgers', 'ledger')
      .leftJoinAndSelect('property.finances', 'finance')
      .leftJoinAndSelect('property.tenant', 'tenant')
      .leftJoinAndSelect('property.agreements', 'agreement')
      .leftJoinAndSelect('agreement.logistical_items', 'logistical_items');

    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });
    const itemCount = await queryBuilder.getCount();
    query = query
      .select([
        'property.id as id',
        'property.street as street',
        'property.house_number as house_number',
        'property.extension as extension',
        'property.city as city',
        'property.zip_code as zip_code',
        'property.country as country',
        'MAX(CASE WHEN logistical_items.type = :rentType THEN logistical_items.amount ELSE 0 END) as rent_amount',
        'MAX(CASE WHEN logistical_items.type = :serviceFeeType THEN logistical_items.amount ELSE 0 END) as service_fee_amount',
        'SUM(DISTINCT CASE WHEN ledger.kind = :cost THEN ledger.amount ELSE 0 END) as costs',
        'SUM(DISTINCT CASE WHEN ledger.kind = :revenues THEN ledger.amount ELSE 0 END) + SUM(DISTINCT CASE WHEN finance.amount > 0 THEN finance.amount ELSE 0 END) as revenues',
      ])
      .setParameters({
        cost: Kind.COST,
        revenues: Kind.REVENUES,
        rentType: LOGISTICAL_TYPE.RENT,
        serviceFeeType: LOGISTICAL_TYPE.SERVICE_FEE,
      });
    const entities = await query
      .groupBy(
        'property.id, property.street, property.house_number, property.extension, property.city, property.zip_code',
      )
      .getRawMany();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getPropertyById(property: Property) {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');
    return queryBuilder
      .leftJoinAndSelect('property.tenant', 'tenant')
      .leftJoinAndSelect('property.agreements', 'agreement')
      .leftJoinAndSelect('property.type', 'property_type')
      .leftJoinAndSelect('property.energy_insulation', 'energy_insulation')
      .leftJoinAndSelect('property.attachments', 'attachment')
      .leftJoinAndSelect('property.tasks', 'task')
      .leftJoinAndSelect('property.notes', 'note_entity')
      .leftJoinAndSelect('agreement.renters', 'renters')
      .leftJoinAndSelect('property.mortgageLines', 'mortgageLine')
      .where('property.id = :propertyId', { propertyId: property.id })
      .getOne();
  }

  async removePropertyById(id: number) {
    await Task.delete({
      property: { id },
    });

    const agreements = await Agreement.find({
      where: {
        property: {
          id: id,
        },
      },
    });

    await LogisticalItem.delete({
      agreement: {
        id: In(agreements.map((item) => item.id)),
      },
    });

    await PropertyAttachment.delete({
      property: { id },
    });

    await Ledger.delete({
      property: { id },
    });

    await Finance.delete({
      property: { id },
    });

    await Agreement.delete({
      property: { id },
    });

    await Ledger.delete({
      property: { id },
    });

    await NoteEntity.delete({
      property: { id },
    });

    await this.propertyRepository.delete(id);
    return 'Property is deleted';
  }

  async updatePropertyById(
    property: Property,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const updateProperty = await this.propertyRepository.findOne({
      where: { id: property.id },
    });

    const propertyType = await this.typeRepository.findOne({
      where: { id: updatePropertyDto.typeId },
    });

    if (!propertyType) {
      throw new NotFoundException('Type bestaat niet');
    }

    updateProperty.type = propertyType;
    updateProperty.description = updatePropertyDto.description;
    updateProperty.street = updatePropertyDto.street;
    updateProperty.house_number = updatePropertyDto.house_number;
    updateProperty.extension = updatePropertyDto.extension;
    updateProperty.city = updatePropertyDto.city;
    updateProperty.zip_code = updatePropertyDto.zip_code;
    updateProperty.country = updatePropertyDto.country;
    updateProperty.size = updatePropertyDto.size;
    updateProperty.plot_size = updatePropertyDto.plot_size;
    updateProperty.bedroom_number = updatePropertyDto.bedroom_number;
    updateProperty.workroom_number = updatePropertyDto.workroom_number;
    updateProperty.rooms_number = updatePropertyDto.rooms_number;
    updateProperty.bathroom_number = updatePropertyDto.bathroom_number;
    updateProperty.year = updatePropertyDto.year;
    updateProperty.energy_level = updatePropertyDto.energy_level;
    updateProperty.energy_heating = updatePropertyDto.energy_heating;

    if (updatePropertyDto.insulationIds?.length > 0) {
      const insulation = await this.insulationRepository.find({
        where: { id: In(updatePropertyDto.insulationIds) },
      });

      if (!insulation) {
        throw new NotFoundException('Isolatie bestaat niet');
      }

      updateProperty.energy_insulation = insulation;
    }

    await updateProperty.save();

    return updateProperty;
  }

  async updatePropertyNoteById(
    id: number,
    property: Property,
    updateNote: UpdatePropertyNoteDto,
  ) {
    try {
      // Get existing notes
      const existingNotes = await this.noteRepository.find({
        where: { property: { id } },
      });

      const existingNotesMap = new Map(
        existingNotes.map((note) => [note.id, note]),
      );

      const updatedNotes = [];

      if (updateNote.notes.length > 0) {
        for (const item of updateNote.notes) {
          if (item.id && existingNotesMap.has(item.id)) {
            // Update existing note
            const existingNote = existingNotesMap.get(item.id);
            const changes = [];

            if (existingNote.name !== item.name) {
              changes.push({
                type: 'name',
                old: existingNote.name,
                new: item.name,
              });
            }

            if (existingNote.description !== item.description) {
              changes.push({
                type: 'description',
                old: existingNote.description,
                new: item.description,
              });
            }

            if (changes.length > 0) {
              const history = existingNote.history || [];
              history.push({
                timestamp: new Date().toISOString(),
                changes,
              });

              const updatedNote = await this.noteRepository.save({
                ...existingNote,
                name: item.name,
                description: item.description,
                history,
              });
              updatedNotes.push(updatedNote);
            } else {
              updatedNotes.push(existingNote);
            }

            existingNotesMap.delete(item.id);
          } else {
            // Create new note
            const newNote = this.noteRepository.create({
              property,
              name: item.name,
              description: item.description,
              history: item.history || [
                {
                  timestamp: new Date().toISOString(),
                  type: 'created',
                },
              ],
            });
            const savedNote = await this.noteRepository.save(newNote);
            updatedNotes.push(savedNote);
          }
        }
      }

      // Delete notes that weren't in the update
      if (existingNotesMap.size > 0) {
        await this.noteRepository.delete(Array.from(existingNotesMap.keys()));
      }

      return updatedNotes;
    } catch (error) {
      console.error('Error updating property notes:', error);
      throw error;
    }
  }

  async updatePropertyAttachmentsById(
    id: number,
    property: Property,
    updateAttachments: UpdatePropertyAttachmentsDto,
  ) {
    await PropertyAttachment.delete({
      property: { id },
    });

    const attachments = updateAttachments.attachments.map(async (item) => {
      const attachment = this.attachmentRepository.create({
        property,
        ...item,
        type: ATACHMENT_TYPE.FILE,
      });
      await this.attachmentRepository.save(attachment);
    });

    const images = updateAttachments.images.map(async (item) => {
      const image = this.attachmentRepository.create({
        property,
        ...item,
        type: ATACHMENT_TYPE.IMAGE,
      });
      await this.attachmentRepository.save(image);
    });

    await Promise.all(attachments);
    await Promise.all(images);

    return 'Property attachments was updated';
  }

  async createPropertyType(createDto: CreatePropertyTypeDto) {
    const propertyType = new PropertyType();
    propertyType.name = createDto.name;
    await propertyType.save();
    return propertyType;
  }

  async createEnergyInsulation(createDto: CreateEnergyInsulationDto) {
    const energyInsulation = new EnergyInsulation();
    energyInsulation.name = createDto.name;
    await energyInsulation.save();
    return energyInsulation;
  }

  getAllPropertyTypes() {
    return this.typeRepository.find();
  }

  getAllEnergyInsulation() {
    return this.insulationRepository.find();
  }

  async getPropertyTypeById(id: number) {
    const propertyType = await this.typeRepository.findOne({
      where: { id },
    });

    if (!propertyType) {
      throw new NotFoundException('Klant bestaat niet');
    }

    return propertyType;
  }

  async removePropertyTypeById(id: number) {
    await PropertyAttachment.delete({
      property: { id },
    });
    await this.typeRepository.delete(id);
    return 'Type was deleted.';
  }

  async updatePropertyTypeById(id: number, updateDto: UpdatePropertyTypeDto) {
    const propertyType = await this.typeRepository.findOne({
      where: { id },
    });

    if (!propertyType) {
      throw new NotFoundException('Object bestaat niet');
    }

    propertyType.name = updateDto.name;
    await propertyType.save();
    return propertyType;
  }

  async getEnergyInsulationById(id: number) {
    const energyInsulation = await this.insulationRepository.findOne({
      where: { id },
    });

    if (!energyInsulation) {
      throw new NotFoundException('Isolatie bestaat niet');
    }

    return energyInsulation;
  }

  async removeEnergyInsulationById(id: number) {
    await PropertyAttachment.delete({
      property: { id },
    });
    await this.insulationRepository.delete(id);
    return 'Isolatie was deleted.';
  }

  async updateEnergyInsulationById(
    id: number,
    updateDto: UpdateEnergyInsulationDto,
  ) {
    const energyInsulation = await this.insulationRepository.findOne({
      where: { id },
    });

    if (!energyInsulation) {
      throw new NotFoundException('Object bestaat niet');
    }

    energyInsulation.name = updateDto.name;
    await energyInsulation.save();
    return energyInsulation;
  }

  async editPropertyEnergyInformation(
    id: number,
    updateDto: UpdatePropertyEnergyInformationDto,
  ) {
    const property = await this.propertyRepository.findOne({
      where: { id },
    });

    property.pairingCode = updateDto.pairingCode;
    property.energySupplier = updateDto.supplier;
    property.energyCosts = updateDto.energyCosts;
    property.gasCosts = updateDto.gasCosts;
    property.networkManagementCosts = updateDto.networkManagementCosts;

    return await property.save();
  }

  async editPropertyValue(id: number, updateDto: UpdatePropertyValueDto) {
    const property = await this.propertyRepository.findOne({
      where: { id },
    });

    property.purchaseValue = updateDto.purchaseValue;
    property.marketValue = updateDto.marketValue;
    property.wozValue = updateDto.wozValue;

    return await property.save();
  }

  async getMortgageLinesByPropertyId(
    property: Property,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder =
      this.mortgageLineRepository.createQueryBuilder('mortgageLine');

    let query = queryBuilder.leftJoinAndSelect(
      'mortgageLine.property',
      'property',
    );

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    // if (pageDtoKeys.indexOf('sort:loanParts') > -1) {
    //   const sortValue = getValue('sort:loanParts', pageOptionsDto);
    //   pageDtoKeys.splice(pageDtoKeys.indexOf('sort:loanParts'), 1);
    // }
    const entityFields = this.mortgageLineRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'mortgageLine',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.mortgageLineRepository.metadata,
      query,
    );

    query = query.where('property.id = :propertyId', {
      propertyId: property.id,
    });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async deleteMortgageLineByPropertyId(property: Property, id: number) {
    const mortgageLine = await this.mortgageLineRepository.findOne({
      where: { id },
    });

    if (!mortgageLine) {
      throw new NotFoundException('Mortgage line not found');
    }

    property.mortgageLines = property.mortgageLines.filter(
      (ml) => ml.id !== mortgageLine.id,
    );

    await this.propertyRepository.save(property);
    return await this.mortgageLineRepository.remove(mortgageLine);
  }

  async getEarnEPropertyByPropertyId(
    property: Property,
    startDate: moment.Moment,
    endDate: moment.Moment,
    interval: string,
  ): Promise<{
    property: PropertyData | null;
  }> {
    const earnEProperty = await this.getEarnEProperty(
      property,
      startDate,
      endDate,
    );

    if (!earnEProperty) {
      return { property: null };
    }

    const dateFormat = this.dateFormats[interval];

    const propertyData = this.aggregatePropertyData(
      earnEProperty,
      startDate,
      endDate,
      interval,
    );

    return {
      property: propertyData,
    };
  }

  private async getEarnEProperty(
    property: Property,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ): Promise<Property | null> {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    const earnEProperty = await queryBuilder
      .leftJoinAndSelect('property.earnEProperties', 'earnEProperty')
      .where('property.id = :propertyId', { propertyId: property.id })
      .andWhere('property.pairingCode IS NOT NULL')
      .andWhere('earnEProperty.deviceId = property.pairingCode')
      .andWhere('earnEProperty.timestamp BETWEEN :startDate AND :endDate', {
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      })
      .getOne();

    return earnEProperty;
  }

  private aggregatePropertyData(
    property: Property,
    startDate: moment.Moment,
    endDate: moment.Moment,
    interval: string,
  ): PropertyData {
    const { unit, count } = this.intervalDurationMapping[interval];
    const periodCount = this.getPeriodCount(interval, startDate, endDate);
    const dateFormat = this.dateFormats[interval];

    const intervalData = this.calculateIntervalData(
      property,
      startDate,
      endDate,
      interval,
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

  private calculateIntervalData(
    property: Property,
    startDate: moment.Moment,
    endDate: moment.Moment,
    interval: string,
  ): EnergyDataInterval {
    const earnEProperties = property.earnEProperties || [];
    const lastEntry = earnEProperties[earnEProperties.length - 1];

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

  async createMortgageLineByPropertyId(
    id: number,
    createDto: CreateMortgageLineDto,
  ) {
    const property = await this.propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Object bestaat niet');
    }

    // Check if a mortgage for this property already exists with that part
    if (property.mortgageLines.some((line) => line.part === createDto.part)) {
      throw new HttpException(
        'A mortgage line with the same part already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const mortgageLine = new MortgageLine();
    mortgageLine.startDate = new Date(createDto.startDate);
    mortgageLine.endDate = new Date(createDto.endDate);
    mortgageLine.type = createDto.type;
    mortgageLine.part = createDto.part;
    mortgageLine.amount = createDto.amount;
    mortgageLine.interestRate = createDto.interestRate;
    mortgageLine.property = property;

    // Calculate mortgage details based on the type
    let mortgageDetails: MortgageDetails;

    if (mortgageLine.type === Type.ANNUITY) {
      mortgageDetails = calculateAnnuityMortgageDetails(
        mortgageLine.amount,
        mortgageLine.interestRate,
        mortgageLine.startDate,
        mortgageLine.endDate,
      );
    } else if (mortgageLine.type === Type.LINEAR) {
      mortgageDetails = calculateLinearMortgageDetails(
        mortgageLine.amount,
        mortgageLine.interestRate,
        mortgageLine.startDate,
        mortgageLine.endDate,
      );
    }

    // Add calculated details to the mortgage line for reference (if needed)
    mortgageLine.duration = mortgageDetails.durationMonths;
    mortgageLine.monthlyPayment = mortgageDetails.monthlyPayment;
    mortgageLine.accumulatedAmount = mortgageDetails.remainingAmount;

    return await this.mortgageLineRepository.save(mortgageLine);
  }

  async getEarnEPropertiesByTenant(
    tenantId: number,
    pageOptionsDto: PageOptionsDto,
  ) {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');
    let query = queryBuilder
      .leftJoinAndSelect('property.tenant', 'tenant')
      .leftJoinAndSelect('property.agreements', 'agreement')
      .leftJoinAndSelect('agreement.primaryRenter', 'primaryRenter')
      .leftJoinAndSelect('agreement.renters', 'renters');

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.propertyRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'property',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.propertyRepository.metadata,
      query,
      true,
    );

    query = query
      .andWhere('tenant.id = :tenantId', { tenantId: tenantId })
      .andWhere('property.hasEarnE = false');

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
      allowUnpaginated: true,
    });
    return new PageDto(entities, pageMetaDto);
  }
}

export function calculateAnnuityMortgageDetails(
  amount: number,
  annualInterestRate: number,
  startDate: Date,
  endDate: Date,
) {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const durationMonths = Math.max(getMonthDifference(startDate, endDate), 1);

  // Monthly Payment Calculation
  const monthlyPayment =
    (amount *
      (monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, durationMonths))) /
    (Math.pow(1 + monthlyInterestRate, durationMonths) - 1);

  // Initialize accumulated amount and remaining amount
  let accumulatedAmount = 0;
  let remainingAmount = amount;
  let monthsPassed = 0;

  const currentDate = new Date();
  if (startDate <= currentDate) {
    monthsPassed = Math.min(
      getMonthDifference(startDate, currentDate),
      durationMonths,
    );

    for (let i = 0; i < monthsPassed; i++) {
      const interestPayment = remainingAmount * monthlyInterestRate;
      const principalRepayment = monthlyPayment - interestPayment;
      accumulatedAmount += monthlyPayment;
      remainingAmount -= principalRepayment;
    }
  }

  // Calculate the remaining amount after the current month's payment
  const interestPayment = remainingAmount * monthlyInterestRate;
  const principalRepayment = monthlyPayment - interestPayment;
  remainingAmount -= principalRepayment;

  return {
    monthsPassed: monthsPassed,
    durationMonths,
    monthlyPayment,
    accumulatedAmount,
    remainingAmount,
    interestPayment,
    principalRepayment,
    month: monthsPassed + 1,
  };
}

export function calculateLinearMortgageDetails(
  amount: number,
  annualInterestRate: number,
  startDate: Date,
  endDate: Date,
) {
  const durationMonths = Math.max(getMonthDifference(startDate, endDate), 1);
  const monthlyPrincipalRepayment = amount / durationMonths;
  const monthlyInterestRate = annualInterestRate / 12 / 100;

  // Initialize accumulated amount
  let accumulatedAmount = 0;
  let remainingPrincipal = amount;
  let currentMonthlyPayment = 0;
  let principalRepayment = 0;
  let interestPayment = 0;
  let monthsPassed = 0;

  // Get the current date
  const currentDate = new Date();
  monthsPassed = Math.min(
    getMonthDifference(startDate, currentDate),
    durationMonths,
  );

  if (startDate > currentDate) {
    return {
      monthsPassed,
      durationMonths,
      monthlyPayment: 0,
      accumulatedAmount: 0,
      remainingAmount: amount,
      principalRepayment: 0,
      interestPayment: 0,
      month: 0,
    };
  }

  // Accumulate payments for all previous months
  for (let i = 0; i < monthsPassed; i++) {
    interestPayment = remainingPrincipal * monthlyInterestRate;
    const monthlyPayment = monthlyPrincipalRepayment + interestPayment;
    accumulatedAmount += monthlyPayment;
    remainingPrincipal -= monthlyPrincipalRepayment;
  }

  // Calculate the monthly payment for the current month
  if (monthsPassed < durationMonths) {
    interestPayment = remainingPrincipal * monthlyInterestRate;
    currentMonthlyPayment = monthlyPrincipalRepayment + interestPayment;
    principalRepayment = monthlyPrincipalRepayment;
    remainingPrincipal -= monthlyPrincipalRepayment; // Adjust remaining amount for the current month
  }

  return {
    monthsPassed,
    durationMonths,
    monthlyPayment: currentMonthlyPayment,
    accumulatedAmount,
    remainingAmount: remainingPrincipal,
    principalRepayment,
    interestPayment,
    month: monthsPassed + 1,
  };
}

function getMonthDifference(startDate: Date, endDate: Date): number {
  return (
    endDate.getFullYear() * 12 +
    endDate.getMonth() -
    (startDate.getFullYear() * 12 + startDate.getMonth())
  );
}
