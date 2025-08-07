import { Test, TestingModule } from '@nestjs/testing';
import { TaxCodesService } from './tax_codes.service';

describe('TaxCodesService', () => {
  let service: TaxCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxCodesService],
    }).compile();

    service = module.get<TaxCodesService>(TaxCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
