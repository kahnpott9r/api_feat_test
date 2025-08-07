import { Module } from '@nestjs/common';
import { ExactOnlineService } from './exact-online.service';
import { ExactOnlineController } from './exact-online.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TaxCode } from '../tax_codes/entities/tax_code.entity';
import { Finance } from '../finance/entites/finance.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TaxCode, Finance])],
  providers: [ExactOnlineService],
  controllers: [ExactOnlineController],
})
export class ExactOnlineModule {}
