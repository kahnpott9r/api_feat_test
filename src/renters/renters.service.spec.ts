import { Test, TestingModule } from '@nestjs/testing';
import { RentersService } from './renters.service';

describe('RentersService', () => {
  let service: RentersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RentersService],
    }).compile();

    service = module.get<RentersService>(RentersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
