import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TENANT_TYPE } from '../entities/tenant.entity';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Email of tenant',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('message.MustEmail') })
  email: string;

  @ApiProperty({
    description: 'The name of the tenant',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  name: string;

  @ApiProperty({
    description: 'The name of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  avatar: string;

  @ApiProperty({
    description: 'The priority of the task(Low, Medium, High)',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(TENANT_TYPE, { message: i18nValidationMessage('message.MustEnum') })
  type: TENANT_TYPE;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsOptional()
  kvk: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsOptional()
  tax_id: string;

  @ApiProperty({
    description: 'The phone of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  phone: string;

  @ApiProperty({
    description: 'The mobile of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  mobile: string;

  @ApiProperty({
    description: 'The street of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  street: string;

  @ApiProperty({
    description: 'The housenumber of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  housenumber: string;

  @ApiProperty({
    description: 'The extensions of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  extensions: string;

  @ApiProperty({
    description: 'The zipcode of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  zipcode: string;

  @ApiProperty({
    description: 'The city of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  city: string;

  @ApiProperty({
    description: 'The iban of the tenant',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  iban: string;
}
