import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementsService } from 'src/agreements/agreements.service';
import { Agreement } from 'src/agreements/entities/agreement.entity';
import { Finance } from 'src/finance/entites/finance.entity';
import { Ledger } from 'src/finance/entites/ledger.entity';
import { PaymentRequest } from 'src/finance/entites/payment-request.entity';
import { FinanceService } from 'src/finance/finance.service';
import { LogisticalItem } from 'src/logistical_items/entities/logistical_item.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { OppProvider } from 'src/payment/entities/opp_provider.entity';
import { PaymentService } from 'src/payment/payment.service';
import { Property } from 'src/properties/entities/property.entity';
import { Renter } from 'src/renters/entities/renters.entity';
import { TaxCode } from 'src/tax_codes/entities/tax_code.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { EmailService } from 'src/Utils/EmailService';
import { WebRequestService } from 'src/Utils/WebRequestService';
import { SchedulerService } from './scheduler.service';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/entities/task.entity';
import { ExactOnlineService } from '../exact-online/exact-online.service';
import { MortgageLine } from '../mortgage_lines/entities/mortgage-line.entity';
import { TaskAttachment } from '../tasks/entities/task-attachments.entity';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Agreement,
      TaxCode,
      LogisticalItem,
      Finance,
      Property,
      Tenant,
      Notification,
      OppProvider,
      PaymentRequest,
      Ledger,
      Renter,
      Task,
      MortgageLine,
      TaskAttachment,
      Supplier,
    ]),
  ],
  providers: [
    SchedulerService,
    AgreementsService,
    PaymentService,
    ExactOnlineService,
    EmailService,
    WebRequestService,
    FinanceService,
    TasksService,
  ],
})
export class SchedulerModule {}
