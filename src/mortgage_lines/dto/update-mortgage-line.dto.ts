import { CreateMortgageLineDto } from './create-mortgage-line.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateMortgageLineDto extends PartialType(CreateMortgageLineDto) {}
