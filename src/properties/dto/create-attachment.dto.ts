import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateAttachment {
  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  url: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  description: string;
}
