import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

describe('TenantsController', () => {
  let controller: TenantsController;

  beforeEach(async () => {
    const TenentServiceProvider = {
      provide: TenantsService,
      useFactory: () => ({
        findAll: jest.fn(() => []),
        findOne: jest.fn(() => {}),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [TenantsService, TenentServiceProvider],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
