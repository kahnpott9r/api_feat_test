import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateOPP {
  @ApiProperty({
    description: 'phone number',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  phone_number: string;
}
