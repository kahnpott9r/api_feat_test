import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class EmailCheckDto {
  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('message.MustEmail') })
  email: string;
}
