import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'email',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  email: string;

  @ApiProperty({
    description: 'domain of the site',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  domain: string;
}
