import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAgreementDto } from './create-agreement.dto';

export class UpdateAgreementDto extends PartialType(
  OmitType(CreateAgreementDto, ['tenantId'] as const),
) {}
