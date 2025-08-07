import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tenant } from '../tenants/entities/tenant.entity';
import { Property } from '../properties/entities/property.entity';
import { Renter } from '../renters/entities/renters.entity';
import { LogisticalItem } from './entities/logistical_item.entity';
import { CreateLogisticalItemDto } from './dto/create-logistical-item.dto';
import { Agreement } from '../agreements/entities/agreement.entity';
import { UpdateLogisticalItemDto } from './dto/update-logistical-item.dto';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';

@Injectable()
export class LogisticalItemsService {
  constructor(
    @InjectRepository(LogisticalItem)
    private logisticalRepository: Repository<LogisticalItem>,
    @InjectRepository(TaxCode) private taxCodeRepository: Repository<TaxCode>,
  ) {}

  async create(
    agreement: Agreement,
    tenant: Tenant,
    createDto: CreateLogisticalItemDto,
  ) {
    const item = new LogisticalItem();
    item.name = createDto.name;
    item.amount = createDto.amount;
    item.type = createDto.type;
    item.tenant = tenant;
    item.agreement = agreement;
    await item.save();
    return item;
  }

  async getAllLogisticalItems() {
    return this.logisticalRepository.find();
  }

  async getLogisticalItemsByTenant(tenantId: number) {
    const logisticalItems = await this.logisticalRepository.find({
      where: {
        tenant: {
          id: tenantId,
        },
      },
    });

    if (!logisticalItems) {
      throw new NotFoundException('Taak bestaat niet');
    }
    return logisticalItems;
  }

  async getLogisticalItemById(item: LogisticalItem, id: number) {
    return item;
  }

  async removeAgreementById(item: LogisticalItem, id: number) {
    await this.logisticalRepository.delete(id);
    return 'Logistical Item was deleted.';
  }

  async updateAgreementById(
    item: LogisticalItem,
    id: number,
    updateDto: UpdateLogisticalItemDto,
  ) {
    await this.logisticalRepository.update(id, updateDto);
    return 'Logistical Item was updated';
  }
}
