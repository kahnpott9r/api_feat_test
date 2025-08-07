import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaxCodesService } from './tax_codes.service';
import { TaxCodesController } from './tax_codes.controller';
import { TaxCode } from './entities/tax_code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaxCode])],
  providers: [TaxCodesService],
  controllers: [TaxCodesController],
})
export class TaxCodesModule {}
