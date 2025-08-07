// note.dto.ts
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsObject,
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

export class CreateNote {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  name: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  description: string;

  @ApiProperty({ required: false, type: [NoteHistoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteHistoryDto)
  @IsOptional()
  history?: NoteHistoryDto[];
}

export class UpdateRenterNoteDto {
  @ApiProperty({ type: [CreateNote] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNote)
  notes: CreateNote[];
}
