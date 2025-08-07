import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserRoleDto {
  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  userId: number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  tenantId: number;
}
