import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { Renter } from 'src/renters/entities/renters.entity';
import { TaxCode } from 'src/tax_codes/entities/tax_code.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { WebRequestService } from 'src/Utils/WebRequestService';
import { PaymentNotifyController } from './payment_notify.controller';
import { PaymentNotifyService } from './payment_notify.service';
import { MortgageLine } from '../mortgage_lines/entities/mortgage-line.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      OppProvider,
      Tenant,
      Notification,
      PaymentRequest,
      Ledger,
      Finance,
      Agreement,
      LogisticalItem,
      Renter,
      TaxCode,
      MortgageLine,
    ]),
  ],
  controllers: [PaymentNotifyController],
  providers: [
    PaymentNotifyService,
    WebRequestService,
    ConfigService,
    FinanceService,
    AgreementsService,
  ],
})
export class PaymentNotifyModule {}
