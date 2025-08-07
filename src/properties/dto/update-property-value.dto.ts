import { PartialType } from '@nestjs/swagger';
import { CreatePropertyValueDto } from './create-property-value.dto';

export class UpdatePropertyValueDto extends PartialType(
  CreatePropertyValueDto,
) {}
