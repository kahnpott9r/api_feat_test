import { Test, TestingModule } from '@nestjs/testing';
import { TaxCodesController } from './tax_codes.controller';

describe('TaxCodesController', () => {
  let controller: TaxCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxCodesController],
    }).compile();

    controller = module.get<TaxCodesController>(TaxCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
