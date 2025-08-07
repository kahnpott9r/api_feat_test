import { Test, TestingModule } from '@nestjs/testing';
import { PaymentNotifyService } from './payment_notify.service';

describe('PaymentNotifyService', () => {
  let service: PaymentNotifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentNotifyService],
    }).compile();

    service = module.get<PaymentNotifyService>(PaymentNotifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
