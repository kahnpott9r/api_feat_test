import { ROLE } from '../entities/user_role.entity';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserRoleDto {
  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  @IsEnum(ROLE, {
    each: true,
    message: i18nValidationMessage('message.MustEnum'),
  })
  role: ROLE;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  userId: number;

  @ApiProperty()
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  tenantId: number;
}
