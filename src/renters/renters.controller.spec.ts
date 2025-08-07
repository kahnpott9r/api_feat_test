import { Test, TestingModule } from '@nestjs/testing';
import { RentersController } from './renters.controller';

describe('RentersController', () => {
  let controller: RentersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentersController],
    }).compile();

    controller = module.get<RentersController>(RentersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
