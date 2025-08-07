import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Type } from 'class-transformer';

export class NoteHistoryChangeDto {
  @ApiProperty()
  @IsString()
  type: 'name' | 'description';

  @ApiProperty()
  @IsString()
  old: string;

  @ApiProperty()
  @IsString()
  new: string;
}

export class NoteHistoryDto {
  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  type?: 'created';

  @ApiProperty({ required: false, type: [NoteHistoryChangeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteHistoryChangeDto)
  @IsOptional()
  changes?: NoteHistoryChangeDto[];
}

export class CreateSupplierNoteDto {
  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  name: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  description: string;

  @ApiProperty({ required: false, type: [NoteHistoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteHistoryDto)
  @IsOptional()
  history?: NoteHistoryDto[];
} 