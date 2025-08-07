import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { TaskCategory, TaskPriority, TaskStatus, TaskSubCategory } from '../entities/task.entity';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The description of the task(optional)',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  description: string;

  @ApiProperty({
    description: 'The priority of the task(Low, Medium, High)',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(TaskPriority, {
    message: i18nValidationMessage('message.MustEnum'),
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'The status of the task(Open, In progress, Done)',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(TaskStatus, { message: i18nValidationMessage('message.MustEnum') })
  status: TaskStatus;

  @ApiProperty({
    description: 'The started date of the task',
  })
  @IsOptional()
  started_at: Date;

  @ApiProperty({
    description: 'The deadline date of the task',
  })
  @IsOptional()
  deadline_at: Date;

  @ApiProperty({
    description: 'The property Id of the task',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  propertyId: number;

  @ApiProperty({
    description: 'The tenant Id of the task',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  tenantId: number;

  @ApiProperty({
    description: 'The attachments of the task',
    required: false,
  })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiProperty({
    description: 'The category of the task',
    required: false,
  })
  @IsEnum(TaskCategory, { message: i18nValidationMessage('message.MustEnum') })
  category: TaskCategory;

  @ApiProperty({
    description: 'The category of the task',
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskSubCategory, { message: i18nValidationMessage('message.MustEnum') })
  subCategory: TaskSubCategory;

  @ApiProperty({
    description: 'The supplier Id of the task',
    required: false,
  })
  @IsOptional()
  supplierId: number;

  @ApiProperty({
    description: 'The scheduled date of the task',
    required: false,
  })
  @IsOptional()
  scheduled_at: Date;

  @ApiProperty({
    description: 'The completed date of the task',
    required: false,
  })
  @IsOptional()
  completed_at: Date;
}
