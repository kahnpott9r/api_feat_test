import { Test, TestingModule } from '@nestjs/testing';
import { LogisticalItemsService } from './logistical_items.service';

describe('LogisticalItemsService', () => {
  let service: LogisticalItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogisticalItemsService],
    }).compile();

    service = module.get<LogisticalItemsService>(LogisticalItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
