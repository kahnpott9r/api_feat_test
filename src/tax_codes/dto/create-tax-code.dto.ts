import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTaxCodeDto {
  @ApiProperty({
    description: 'name of tax code',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  name: string;

  @ApiProperty({
    description: 'percentage of tax code',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  percentage: number;
}
