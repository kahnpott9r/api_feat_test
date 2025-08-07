import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementsService } from 'src/agreements/agreements.service';
import { Agreement } from 'src/agreements/entities/agreement.entity';
import { LogisticalItem } from 'src/logistical_items/entities/logistical_item.entity';

import { Property } from 'src/properties/entities/property.entity';
import { Renter } from 'src/renters/entities/renters.entity';
import { TaxCode } from 'src/tax_codes/entities/tax_code.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Finance } from './entites/finance.entity';
import { Ledger } from './entites/ledger.entity';
import { PaymentRequest } from './entites/payment-request.entity';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { MortgageLine } from '../mortgage_lines/entities/mortgage-line.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      Tenant,
      Finance,
      PaymentRequest,
      Ledger,
      Finance,
      Renter,
      Agreement,
      LogisticalItem,
      TaxCode,
      MortgageLine,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService, AgreementsService],
})
export class FinanceModule {}
