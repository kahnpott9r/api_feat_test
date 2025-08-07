import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogisticalItemsService } from './logistical_items.service';
import { LogisticalItemsController } from './logistical_items.controller';
import { LogisticalItem } from './entities/logistical_item.entity';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogisticalItem, TaxCode])],
  providers: [LogisticalItemsService],
  controllers: [LogisticalItemsController],
})
export class LogisticalItemsModule {}
