import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { GENDERS } from '../entities/renters.entity';
import { CreateAttachment } from 'src/properties/dto/create-attachment.dto';
import { CreateNote } from 'src/properties/dto/create-note.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateRenterDto {
  @ApiProperty({
    description: 'The first name of the renter',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  first_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  avatar: string;

  @ApiProperty({
    description: 'The last name of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  last_name: string;

  @ApiProperty({
    description: 'The email of the renter',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsEmail({}, { message: i18nValidationMessage('message.MustEmail') })
  email: string;

  @ApiProperty({
    description: 'The phone of the renter',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  phone: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  birth_day: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsOptional()
  kvk: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsOptional()
  tax_id: string;

  @ApiProperty({
    description: 'The company name of the renter',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsOptional()
  company_name: string;

  @ApiProperty({
    description: 'The invoice_email of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @ValidateIf((_, value) => value !== '') // Only validate if the value is not an empty string
  @IsEmail({}, { message: i18nValidationMessage('message.MustEmail') })
  invoice_email: string;

  @ApiProperty({
    description: 'The invoice_street of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_street: string;

  @ApiProperty({
    description: 'The invoice_housenumber of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_housenumber: string;

  @ApiProperty({
    description: 'The invoice_extensions of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_extensions: string;

  @ApiProperty({
    description: 'The invoice_zipcode of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_zipcode: string;

  @ApiProperty({
    description: 'The invoice_city of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  invoice_city: string;

  @ApiProperty({
    description: 'The iban of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  iban: string;

  @ApiProperty({
    description: 'The gender of the renter (male, female, other)',
  })
  @IsOptional() // Make the property optional
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @Validate(genderValidator) // Custom validator for gender
  gender?: GENDERS | null;

  @ApiProperty({
    description: 'The tenant Id of the renter',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  tenantId: number;

  @ApiProperty({
    description: 'The attachments item arrary',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  attachments: Array<CreateAttachment>;

  @ApiProperty({
    description: 'The attachments item arrary',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  notes: Array<CreateNote>;

  @ApiProperty({
    description: 'The exactId of the renter',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  exactId: string;
}

function genderValidator(value: string): boolean {
  if (!value || value === '') {
    return true; // Allow null or empty string as valid values
  }

  return Object.values(GENDERS).includes(value as GENDERS);
}
