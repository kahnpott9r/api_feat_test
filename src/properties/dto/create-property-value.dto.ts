import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreatePropertyValueDto {
  @ApiProperty({
    description: 'The purchase value of the property',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  purchaseValue: number;

  @ApiProperty({
    description: 'The market value of the property',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  marketValue: number;

  @ApiProperty({
    description: 'The woz value of the property',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  wozValue: number;
}
