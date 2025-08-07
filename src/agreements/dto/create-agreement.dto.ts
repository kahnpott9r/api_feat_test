import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { CreateLogisticalItemDto } from 'src/logistical_items/dto/create-logistical-item.dto';
import { PaymentMethod } from '../entities/agreement.entity';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateAgreementDto {
  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(PaymentMethod, { message: i18nValidationMessage('message.MustEnum') })
  payment_method: PaymentMethod;

  @ApiProperty({
    description: 'The renter Id of the agreement',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  renterIds: Array<number>;

  @ApiProperty({
    description: 'The primary renter Id of the agreement',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  primaryRenterId: number;

  @ApiProperty({
    description: 'The payment date',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  paymentDate: number;

  @ApiProperty({
    description: 'The property Id of the agreement',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  propertyId: number;

  @ApiProperty({
    description: 'The tenant Id of the agreement',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  tenantId: number;

  @ApiProperty({
    description: 'The logistical item array of the agreement',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  items: Array<CreateLogisticalItemDto>;

  @ApiProperty({
    description: 'The start date of the task',
  })
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the task',
  })
  @IsOptional()
  endDate: Date;
}
