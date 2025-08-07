import { Module } from '@nestjs/common';
import { RentersService } from './renters.service';
import { RentersController } from './renters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Renter } from './entities/renters.entity';
import { PropertyAttachment } from '../properties/entities/property-attachments.entity';
import { NoteEntity } from '../properties/entities/note.entity';
import { AgreementsService } from '../agreements/agreements.service';
import { Agreement } from '../agreements/entities/agreement.entity';
import { LogisticalItem } from 'src/logistical_items/entities/logistical_item.entity';
import { TaxCode } from 'src/tax_codes/entities/tax_code.entity';
import { ExactOnlineModule } from '../exact-online/exact-online.module';
import { ExactOnlineService } from '../exact-online/exact-online.service';
import { Finance } from '../finance/entites/finance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      Renter,
      PropertyAttachment,
      NoteEntity,
      Agreement,
      LogisticalItem,
      TaxCode,
      Finance,
    ]),
  ],
  providers: [RentersService, AgreementsService, ExactOnlineService],
  controllers: [RentersController],
})
export class RentersModule {}
