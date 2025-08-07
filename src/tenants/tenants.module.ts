import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { TasksModule } from '../tasks/tasks.module';
import { Property } from '../properties/entities/property.entity';
import { PropertiesService } from '../properties/properties.service';
import { PropertyType } from '../properties/entities/property_type.entity';
import { RentersService } from '../renters/renters.service';
import { Renter } from '../renters/entities/renters.entity';
import { UserRole } from '../user_roles/entities/user_role.entity';
import { AgreementsService } from '../agreements/agreements.service';
import { Agreement } from '../agreements/entities/agreement.entity';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';
import { LogisticalItem } from '../logistical_items/entities/logistical_item.entity';
import { PropertyAttachment } from 'src/properties/entities/property-attachments.entity';
import { NoteEntity } from 'src/properties/entities/note.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { FinanceService } from 'src/finance/finance.service';
import { Finance } from 'src/finance/entites/finance.entity';
import { PaymentRequest } from 'src/finance/entites/payment-request.entity';
import { Ledger } from 'src/finance/entites/ledger.entity';
import { UserRolesService } from '../user_roles/user_roles.service';
import { PaymentService } from '../payment/payment.service';
import { EmailService } from '../Utils/EmailService';
import { WebRequestService } from '../Utils/WebRequestService';
import { HttpModule } from '@nestjs/axios/dist';
import { OppProvider } from '../payment/entities/opp_provider.entity';
import { ExactOnlineService } from '../exact-online/exact-online.service';
import { MortgageLine } from '../mortgage_lines/entities/mortgage-line.entity';
import { EnergyInsulation } from '../properties/entities/energy-insulation.entity';
import { EarnEProperty } from '../earn-e/entities/earn-e-property.entity';
import { EarnEService } from '../earn-e/earn-e.service';
import { Task } from 'src/tasks/entities/task.entity';
import { TaskAttachment } from 'src/tasks/entities/task-attachments.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';
import { SuppliersService } from 'src/suppliers/suppliers.service';
import { SupplierAttachment } from 'src/suppliers/entities/supplier-attachments.entity';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      UserRole,
      OppProvider,
      User,
      Tenant,
      Task,
      TaskAttachment,
      Property,
      PropertyType,
      EnergyInsulation,
      Renter,
      Agreement,
      TaxCode,
      LogisticalItem,
      PropertyAttachment,
      NoteEntity,
      Finance,
      PaymentRequest,
      Ledger,
      MortgageLine, 
      EarnEProperty,
      Supplier,
      SupplierAttachment,
    ]),
  ],
  controllers: [TenantsController],
  providers: [
    TenantsService,
    TasksService,
    PropertiesService,
    RentersService,
    AgreementsService,
    UsersService,
    WebRequestService,
    EmailService,
    FinanceService,
    PaymentService,
    UserRolesService,
    ExactOnlineService,
    SuppliersService,
    // EarnEService,
  ],
})
export class TenantsModule {}
