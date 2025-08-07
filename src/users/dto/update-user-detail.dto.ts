import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserDetailDto {
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
  avatar: string;
}
