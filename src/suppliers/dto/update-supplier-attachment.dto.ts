import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CreateSupplierAttachmentDto } from './create-supplier-attachment.dto';
import { ATACHMENT_TYPE } from 'src/Utils/utils';

export class UpdateSupplierAttachmentsDto {
  @ApiProperty({
    description: 'Array of supplier attachments',
    type: [CreateSupplierAttachmentDto],
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  attachments: Array<CreateSupplierAttachmentDto>;
}

export class UpdateSingleSupplierAttachmentDto {
  @ApiProperty({
    description: 'The description of the attachment',
    example: 'This is a description of the attachment',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  description?: string;

  @ApiProperty({
    description: 'The category type of the attachment',
    enum: ATACHMENT_TYPE,
  })
  @IsOptional()
  @IsEnum(ATACHMENT_TYPE, {
    message: i18nValidationMessage('message.MustEnum'),
  })
  type?: ATACHMENT_TYPE;
}
