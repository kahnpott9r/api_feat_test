import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgreementsService } from './agreements.service';
import { AgreementsController } from './agreements.controller';
import { Agreement } from './entities/agreement.entity';
import { LogisticalItem } from '../logistical_items/entities/logistical_item.entity';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';
import { Renter } from '../renters/entities/renters.entity';
import { AgreementsSubscribe } from './agreements.subscribe';
import { FinanceService } from '../finance/finance.service';
import { Finance } from '../finance/entites/finance.entity';
import { PaymentRequest } from '../finance/entites/payment-request.entity';
import { Ledger } from '../finance/entites/ledger.entity';
import { MortgageLine } from '../mortgage_lines/entities/mortgage-line.entity';
import { Property } from '../properties/entities/property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agreement,
      LogisticalItem,
      TaxCode,
      PaymentRequest,
      Ledger,
      Renter,
      Finance,
      Property,
      MortgageLine,
    ]),
  ],
  providers: [AgreementsService, FinanceService, AgreementsSubscribe],
  controllers: [AgreementsController],
})
export class AgreementsModule {}
