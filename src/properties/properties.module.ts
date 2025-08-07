import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { PropertyType } from './entities/property_type.entity';
import { NoteEntity } from './entities/note.entity';
import { PropertyAttachment } from './entities/property-attachments.entity';
import { Agreement } from '../agreements/entities/agreement.entity';
import { AgreementsService } from '../agreements/agreements.service';
import { LogisticalItem } from '../logistical_items/entities/logistical_item.entity';
import { Renter } from '../renters/entities/renters.entity';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';
import { TasksModule } from '../tasks/tasks.module';
import { Tenant } from '../tenants/entities/tenant.entity';
import { FinanceService } from 'src/finance/finance.service';
import { Finance } from 'src/finance/entites/finance.entity';
import { Ledger } from 'src/finance/entites/ledger.entity';
import { PaymentRequest } from 'src/finance/entites/payment-request.entity';
import { MortgageLine } from '../mortgage_lines/entities/mortgage-line.entity';
import { EnergyInsulation } from './entities/energy-insulation.entity';
import { EarnEProperty } from '../earn-e/entities/earn-e-property.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { TaskAttachment } from 'src/tasks/entities/task-attachments.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';
import { EmailService } from '../Utils/EmailService';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      PropertyType,
      EarnEProperty,
      EnergyInsulation,
      PropertyAttachment,
      NoteEntity,
      Agreement,
      LogisticalItem,
      Renter,
      TaxCode,
      Task,
      TaskAttachment,
      Tenant,
      Finance,
      PaymentRequest,
      Ledger,
      MortgageLine,
      Supplier,
    ]),
  ],
  providers: [
    PropertiesService,
    AgreementsService,
    TasksService,
    FinanceService,
    EmailService,
  ],
  controllers: [PropertiesController],
})
export class PropertiesModule {}
