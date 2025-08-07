import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRenterDto } from './create-renter.dto';

export class UpdateRenterDto extends PartialType(
  OmitType(CreateRenterDto, ['tenantId'] as const),
) {}
