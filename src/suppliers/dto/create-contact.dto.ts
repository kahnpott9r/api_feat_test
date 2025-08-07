import { IsEmail, IsString, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ContactDto {
  @IsString({ message: i18nValidationMessage('message.MustString') })
  name: string;
  
  @ValidateIf(o => o.email !== '')
  @IsEmail({}, { message: i18nValidationMessage('validation.MustEmail') })
  email: string;
}
