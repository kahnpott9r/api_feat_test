import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLedgerDto } from './create-ledger.dto';

export class UpdateLedgerDto extends PartialType(
  OmitType(CreateLedgerDto, [] as const),
) {}
