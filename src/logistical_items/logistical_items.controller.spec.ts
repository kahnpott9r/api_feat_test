import { Test, TestingModule } from '@nestjs/testing';
import { LogisticalItemsController } from './logistical_items.controller';

describe('LogisticalItemsController', () => {
  let controller: LogisticalItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogisticalItemsController],
    }).compile();

    controller = module.get<LogisticalItemsController>(
      LogisticalItemsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
