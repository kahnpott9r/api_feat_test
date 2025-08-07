import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePaymentRequestDto } from './create-payment-request.dto';

export class UpdatePaymentRequestDto extends PartialType(
  OmitType(CreatePaymentRequestDto, [] as const),
) {}
