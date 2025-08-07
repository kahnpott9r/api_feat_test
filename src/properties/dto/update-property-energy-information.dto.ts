import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdatePropertyEnergyInformationDto {
  @ApiProperty({
    description: 'The pairing code of the property',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  pairingCode: string;

  @ApiProperty({
    description: 'The energy supplier of the property',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  @IsOptional()
  supplier: string;

  @ApiProperty({
    description: 'The energy costs of the property',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  energyCosts: number;

  @ApiProperty({
    description: 'The gas costs of the property',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsNotEmpty({ message: i18nValidationMessage('message.NotEmpty') })
  gasCosts: number;

  @ApiProperty({
    description: 'The network management costs of the property',
  })
  @IsNumber({}, { message: i18nValidationMessage('message.MustNumber') })
  @IsOptional()
  networkManagementCosts: number;
}
