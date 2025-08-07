import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateNote } from './create-note.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdatePropertyNoteDto {
  @ApiProperty({ default: [] })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  notes: Array<CreateNote>;
}
