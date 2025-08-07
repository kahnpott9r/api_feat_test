import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MortgageLinesController } from './mortgage-line.controller';
import { MortgageLineService } from './mortgage-line.service';
import { MortgageLine } from './entities/mortgage-line.entity';
import { Property } from '../properties/entities/property.entity';
import { MortgageLineSubscriber } from './mortgage-line.subscribe';

@Module({
  imports: [TypeOrmModule.forFeature([MortgageLine, Property])],
  controllers: [MortgageLinesController],
  providers: [MortgageLineService, MortgageLineSubscriber],
})
export class MortgageLineModule {}
