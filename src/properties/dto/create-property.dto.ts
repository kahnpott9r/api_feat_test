import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAttachment } from './create-attachment.dto';
import { CreateNote } from './create-note.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'The description of the property(optional)',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  description: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  street: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  house_number: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  extension: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  city: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  zip_code: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  country: string;

  @ApiProperty()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: i18nValidationMessage('message.MustNumber') },
  )
  @IsOptional()
  size: number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsOptional()
  plot_size: number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsOptional()
  bedroom_number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsOptional()
  rooms_number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsOptional()
  workroom_number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsOptional()
  bathroom_number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsOptional()
  year;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  energy_level;

  // @ApiProperty()
  // @IsArray({ message: i18nValidationMessage('message.MustArray') })
  // // @IsEnum(InsulationType, {
  // //   message: i18nValidationMessage('message.MustEnum'),
  // // })
  // @IsOptional()
  // energy_insulation: Array<InsulationType>;

  @ApiProperty({
    description: 'The array with insulation Ids of the property',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  @IsOptional()
  insulationIds: Array<number>;

  // @ApiProperty({
  //   description: 'The attachments item array',
  // })
  // @IsArray({ message: i18nValidationMessage('message.MustArray') })
  // energy_insulation: Array<CreateEnergyInsulationDto>;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('message.MustString') })
  energy_heating;

  @ApiProperty({
    description: 'The type Id of the property',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  typeId: number;

  @ApiProperty({
    description: 'The tenant Id of the property',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  tenantId: number;

  @ApiProperty({
    description: 'The attachments item array',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  attachments: Array<CreateAttachment>;

  @ApiProperty({
    description: 'The attachments item array',
  })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  images: Array<CreateAttachment>;

  @ApiProperty({ default: [] })
  @IsArray({ message: i18nValidationMessage('message.MustArray') })
  @IsOptional()
  notes: Array<CreateNote>;
}
