import { PartialType } from '@nestjs/swagger';

import { CreateTaxCodeDto } from './create-tax-code.dto';

export class UpdateTaxCode extends PartialType(CreateTaxCodeDto) {}
