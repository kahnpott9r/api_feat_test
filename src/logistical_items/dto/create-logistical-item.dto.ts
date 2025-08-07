import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { LOGISTICAL_TYPE } from '../entities/logistical_item.entity';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateLogisticalItemDto {
  @ApiProperty()
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  name: string;

  @ApiProperty({
    description: 'The renter Id of the logistal item',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  amount: number;

  @ApiProperty({
    description: 'The type of the logistal item',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(LOGISTICAL_TYPE, {
    message: i18nValidationMessage('message.MustEnum'),
  })
  type: LOGISTICAL_TYPE;

  @ApiProperty({
    description: 'The tax code Id of the logistal item',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  taxCodeId: number;
}
