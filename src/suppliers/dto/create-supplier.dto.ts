import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { SupplierType, SupplierStatus } from '../entities/suppliers.entity';
import { ContactDto } from './create-contact.dto';
import { CreateNote } from '../../properties/dto/create-note.dto';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'The company name of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  company_name: string;

  @ApiProperty({
    description: 'The website of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  website: string;

  @ApiProperty({
    description: 'The phone of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  phone: string;

  @ApiProperty({
    description: 'The invoice email of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_email: string;

  @ApiProperty({
    description: 'The invoice street of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_street: string; 

  @ApiProperty({
    description: 'The invoice housenumber of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_housenumber: string;  

  @ApiProperty({
    description: 'The invoice extensions of the supplier',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_extensions: string;

  @ApiProperty({
    description: 'The invoice zipcode of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_zipcode: string;

  @ApiProperty({
    description: 'The invoice city of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_city: string;

  @ApiProperty({
    description: 'The invoice iban of the supplier',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  iban: string;

  @ApiProperty({
    description: 'The hourly rate of the supplier in cents (e.g. 1250 for €12.50)',
    required: false,
    example: 1250,
  })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  hourly_rate?: number;

  @ApiProperty({
    description: 'The contact information of the supplier',
    type: 'object',
    properties: {
      name: { type: 'string', description: 'The contact person name' },
      email: { type: 'string', description: 'The contact person email' }
    }
  })
  @IsObject({ message: i18nValidationMessage('message.MustObject') })
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ApiProperty({
    description: 'The kvk of the supplier',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  coc_number: string;  

  @ApiProperty({
    description: 'The type of the supplier',
  })
  @IsEnum(SupplierType, { message: i18nValidationMessage('message.MustEnum') })
  type: SupplierType;

  @ApiProperty({
    description: 'The status of the supplier',
  })
  @IsEnum(SupplierStatus, { message: i18nValidationMessage('message.MustEnum') })
  status: SupplierStatus;

  @ApiProperty({
    description: 'The tenant Id of the supplier',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  tenantId: number;

  @ApiProperty({ default: [] })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  @ValidateNested({ each: true })
  @Type(() => CreateNote)
  @IsOptional()
  notes: CreateNote[];
}