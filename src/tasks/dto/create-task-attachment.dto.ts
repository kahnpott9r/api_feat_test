import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ATACHMENT_TYPE } from 'src/Utils/utils';

export class CreateTaskAttachmentDto {
  @ApiProperty({
    description: 'The URL of the attachment',
    example: 'https://example.com/image.jpg',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  url: string;

  @ApiProperty({
    description: 'The description of the attachment',
    example: 'This is a description of the attachment',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  description: string;

  @ApiProperty({
    description: 'The size of the file in bytes',
    example: 67375,
  })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  size?: number;

  @ApiProperty({
    description: 'The MIME type of the file',
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  mimeType?: string;

  @ApiProperty({
    description: 'The category type of the attachment',
    enum: ATACHMENT_TYPE,
    default: ATACHMENT_TYPE.IMAGE,
  })
  @IsOptional()
  @IsEnum(ATACHMENT_TYPE, {
    message: i18nValidationMessage('message.MustEnum'),
  })
  type?: ATACHMENT_TYPE;
}

export class CreateTaskAttachmentsDto {
  @ApiProperty({
    description: 'Array of task attachments to create',
    type: [CreateTaskAttachmentDto],
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  attachments: Array<CreateTaskAttachmentDto>;
}
