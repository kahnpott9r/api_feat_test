import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAttachment } from '../../properties/dto/create-attachment.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateRenterAttachmentsDto {
  @ApiProperty({
    description: 'The attachments item arrary',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  attachments: Array<CreateAttachment>;
}
