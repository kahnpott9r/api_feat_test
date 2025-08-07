import { PartialType } from '@nestjs/swagger';
import { CreateEnergyInsulationDto } from './create-energy-insulation.dto';

export class UpdateEnergyInsulationDto extends PartialType(
  CreateEnergyInsulationDto,
) {}
