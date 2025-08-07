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
import { i18nValidationMessage } from 'nestjs-i18n';
import { ROLE } from 'src/user_roles/entities/user_role.entity';

export class UpdateUserSecurityDto {
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
}
