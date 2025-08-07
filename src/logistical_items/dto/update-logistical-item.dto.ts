import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLogisticalItemDto } from './create-logistical-item.dto';

export class UpdateLogisticalItemDto extends PartialType(
  CreateLogisticalItemDto,
) {}
