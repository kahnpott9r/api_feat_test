import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicDecorator } from 'src/auth/decorators/public.decorator';
import { PaymentNotifyService } from './payment_notify.service';
import { RealIP } from 'nestjs-real-ip';

@ApiTags('Payment')
@PublicDecorator()
@Controller('payment-notify')
export class PaymentNotifyController {
  private readonly logger = new Logger(PaymentNotifyController.name);

  constructor(private readonly service: PaymentNotifyService) {}

  @Post()
  notify(@Body() data: any, @RealIP() ip: string) {
    const whitelistIps = [
      '18.193.11.50',
      '18.159.20.179',
      '18.197.215.227',
      '3.120.97.52',
      '3.121.39.192',
    ];
    if (!whitelistIps.includes(ip)) {
      this.logger.warn('IP not whitelisted', ip);
      this.logger.warn(data);
      throw new UnauthorizedException('IP not whitelisted');
    }
    this.logger.log(ip);
    this.service.ProcessNotification(data).then();
  }
}
