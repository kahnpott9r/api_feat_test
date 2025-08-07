import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreatePaymentRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  is_auto: boolean;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  amount: number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  propertyId: number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  tenantId: number;
}
