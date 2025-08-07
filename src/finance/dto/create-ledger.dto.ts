import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Duration, Kind } from '../entites/ledger.entity';

export class CreateLedgerDto {
  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(Kind, { message: i18nValidationMessage('message.MustEnum') })
  kind: Kind;

  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(Duration, { message: i18nValidationMessage('message.MustEnum') })
  duration: Duration;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsOptional()
  startDate: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsOptional()
  endDate: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  description: string;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  propertyId: number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  tenantId: number;
}
