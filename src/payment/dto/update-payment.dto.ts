import { PartialType } from '@nestjs/swagger';
import { CreateOPP } from './create-payment.dto';

export class UpdatePaymentDto extends PartialType(CreateOPP) {}
