import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { UseGuards } from '@nestjs/common/decorators';
import { RoleGuard } from '../auth/guards/role.guard';
import { ROLE } from '../user_roles/entities/user_role.entity';

@ApiBearerAuth()
@UseGuards(RoleGuard([ROLE.ADMIN]))
@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  async get() {
    return await this.paymentService.processAllAgreements().then();
  }
}
