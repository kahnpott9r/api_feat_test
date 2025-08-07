import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ROLE } from 'src/user_roles/entities/user_role.entity';
import { Optional } from '@nestjs/common';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email to log in with',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('message.MustEmail') })
  email: string;

  @ApiProperty({
    minimum: 6,
    maximum: 20,
    description: 'At least 1 capital, 1 small, 1 special character & 1 number',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @MinLength(6)
  @MaxLength(20)
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  password: string;

  @ApiProperty({
    description: 'First name',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  first_name: string;

  @ApiProperty({
    description: 'Last name',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  last_name: string;

  @ApiProperty({
    description: 'Avatar',
  })
  @Optional()
  avatar: string;

  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  tenantId: number;

  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(ROLE, {
    each: true,
    message: i18nValidationMessage('message.MustEnum'),
  })
  role: ROLE;
}
