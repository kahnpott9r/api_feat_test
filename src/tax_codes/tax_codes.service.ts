import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogisticalItem } from 'src/logistical_items/entities/logistical_item.entity';
import { Repository } from 'typeorm';
import { CreateTaxCodeDto } from './dto/create-tax-code.dto';
import { UpdateTaxCode } from './dto/update-tax-code.dto';

import { TaxCode } from './entities/tax_code.entity';

@Injectable()
export class TaxCodesService {
  constructor(
    @InjectRepository(TaxCode) private taxCodeRepository: Repository<TaxCode>,
  ) {}

  async create({ name, percentage }: CreateTaxCodeDto) {
    const code = this.taxCodeRepository.create({
      name,
      percentage,
    });

    return this.taxCodeRepository.save(code);
  }

  findAll() {
    return this.taxCodeRepository.find();
  }

  async findOne(id: number) {
    const code = await this.taxCodeRepository.findOne({
      where: { id: id },
    });
    if (!code) {
      throw new NotFoundException('Code bestaat niet');
    }
    return code;
  }

  async update(id: number, updateDto: UpdateTaxCode) {
    const code = await this.taxCodeRepository.findOne({
      where: { id: id },
    });
    if (!code) {
      throw new NotFoundException('Code bestaat niet');
    }
    code.name = updateDto.name;
    code.percentage = updateDto.percentage;
    await code.save();
    return code;
  }

  async remove(id: number) {
    const code = await this.taxCodeRepository.findOne({
      where: { id: id },
    });
    if (!code) {
      throw new NotFoundException('Code bestaat niet');
    }
    await this.taxCodeRepository.delete(id);
    return 'Tax code deleted';
  }
}
