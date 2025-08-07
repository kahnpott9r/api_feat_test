import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const UserServiceProvider = {
      provide: UsersService,
      useFactory: () => ({
        findAll: jest.fn(() => []),
        findOne: jest.fn((id: number) => {
          return { id: id };
        }),
        update: jest.fn((id: number, updateUserDto: UpdateUserDto) => {
          return { id: id, ...updateUserDto };
        }),
        remove: jest.fn((id: number) => {
          return { id: id };
        }),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, UserServiceProvider],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
