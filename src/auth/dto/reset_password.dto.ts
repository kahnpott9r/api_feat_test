import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @ApiProperty({
    minimum: 6,
    maximum: 20,
    description: 'At least 1 capital, 1 small, 1 special character & 1 number',
  })
  @MinLength(6)
  @MaxLength(20)
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  password: string;
}
