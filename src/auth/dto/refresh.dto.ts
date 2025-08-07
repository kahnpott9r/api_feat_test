import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RefreshDto {
  @ApiProperty({
    description: 'The refresh token',
  })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  refresh_token: string;
}
