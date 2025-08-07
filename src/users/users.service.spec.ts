import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let findOne: jest.Mock;
  let create: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();
    create = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne, create },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should work argon2', async () => {
    const uncryptedPassword = 'password';
    const cryptedPassword = await argon2.hash(uncryptedPassword);
    const match = await argon2.verify(cryptedPassword, uncryptedPassword);
    expect(match).toBeTruthy();
  });

  describe('user management', () => {
    let user: User;
    beforeEach(() => {
      user = new User();
      findOne.mockReturnValue(Promise.resolve(user));
      create.mockReturnValue(Promise.resolve(user));
    });

    it('should return the user', async () => {
      const fetchedUser = await service.findByEmail('test@test.com');
      expect(fetchedUser).toEqual(user);
    });

    it('should create the user', async () => {
      const dto = new CreateUserDto();
      const createUser = service.create(dto);
      await expect(createUser).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
