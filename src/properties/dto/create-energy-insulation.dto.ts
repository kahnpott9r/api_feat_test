import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateEnergyInsulationDto {
  @ApiProperty({
    description: 'The name of the energy insulation',
  })
  @IsString({ message: i18nValidationMessage('message.MustString') })
  name: string;
}
