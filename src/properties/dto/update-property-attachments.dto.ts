import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAttachment } from './create-attachment.dto';
import { CreateNote } from './create-note.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdatePropertyAttachmentsDto {
  @ApiProperty({
    description: 'The attachments item arrary',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  attachments: Array<CreateAttachment>;

  @ApiProperty({
    description: 'The attachments item arrary',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  images: Array<CreateAttachment>;
}
