import { Test, TestingModule } from '@nestjs/testing';
import { PaymentNotifyController } from './payment_notify.controller';

describe('PaymentNotifyController', () => {
  let controller: PaymentNotifyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentNotifyController],
    }).compile();

    controller = module.get<PaymentNotifyController>(PaymentNotifyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
