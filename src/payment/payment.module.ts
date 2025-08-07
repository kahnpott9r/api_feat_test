import { HttpModule } from '@nestjs/axios/dist';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finance } from 'src/finance/entites/finance.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { EmailService } from '../Utils/EmailService';
import { WebRequestService } from '../Utils/WebRequestService';
import { FinanceService } from '../finance/finance.service';
import { ExactOnlineService } from '../exact-online/exact-online.service';
import { AgreementsService } from '../agreements/agreements.service';
import { OppProvider } from './entities/opp_provider.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';
import { PaymentRequest } from '../finance/entites/payment-request.entity';
import { Ledger } from '../finance/entites/ledger.entity';
import { Agreement } from '../agreements/entities/agreement.entity';
import { LogisticalItem } from '../logistical_items/entities/logistical_item.entity';
import { Renter } from '../renters/entities/renters.entity';
import { MortgageLine } from '../mortgage_lines/entities/mortgage-line.entity';
import { Property } from '../properties/entities/property.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Finance,
      OppProvider,
      Tenant,
      TaxCode,
      PaymentRequest,
      Ledger,
      Agreement,
      LogisticalItem,
      Renter,
      Property,
      MortgageLine,
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    EmailService,
    WebRequestService,
    FinanceService,
    ExactOnlineService,
    AgreementsService,
  ],
})
export class PaymentModule {}
