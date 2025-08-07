import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RefreshTokens } from './entity/refresh_token.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RefreshDto } from './dto/refresh.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let authService: AuthService;

  let findOne: jest.Mock;
  let create: jest.Mock;
  let save: jest.Mock;
  let deleteAt: jest.Mock;
  let findByEmail: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();
    create = jest.fn();
    save = jest.fn();
    deleteAt = jest.fn();
    findByEmail = jest.fn((email: string) => {});

    const UserServiceProvider = {
      provide: UsersService,
      useFactory: () => ({
        create: jest.fn((createUserDto: CreateUserDto) => new User()),
        findByEmail,
      }),
    };

    const ConfigServiceProvider = {
      provide: ConfigService,
      useFactory: () => ({
        get: jest.fn((email: string) => new String()),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserServiceProvider,
        ConfigServiceProvider,
        {
          provide: getRepositoryToken(RefreshTokens),
          useValue: { findOne, create, save, delete: deleteAt },
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('In case of there is matching user', () => {
    let refreshToken: RefreshTokens;
    beforeEach(() => {
      refreshToken = new RefreshTokens();
      findOne.mockReturnValue(Promise.resolve(refreshToken));
      create.mockReturnValue(Promise.resolve(refreshToken));
      deleteAt.mockReturnValue(Promise.resolve(refreshToken));
    });

    it('should not log in user - not found user', async () => {
      const dto = new CreateUserDto();
      try {
        await authService.login(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('User not found');
      }
    });

    it('should refresh token', async () => {
      const dto = new RefreshDto();
      const user = new User();
      const refreshToken = await authService.refresh(dto, user);
      expect(refreshToken).toHaveProperty('access_token');
    });

    describe('when password verify with argon2', () => {
      const user = new User();
      user.email = 'test@test.com';
      user.password =
        '$argon2id$v=19$m=65536,t=3,p=4$AgiHLBVqvwMhGS5Lk4ibOw$WkSC0cX98jKYOFhqbgN0ADHpooYxwzffS1BmdfLFHqg';
      beforeEach(() => {
        findByEmail.mockReturnValue(Promise.resolve(user));
      });

      it('should not log in user - invalid password', async () => {
        const dto = new LoginDto();
        dto.password = 'not password';
        try {
          await authService.login(dto);
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toBe('Invalid password');
        }
      });

      it('should log in user', async () => {
        const dto = new LoginDto();
        dto.password = 'password';
        const loginResult = await authService.login(dto);
        expect(loginResult).toHaveProperty('access_token');
      });
    });
  });

  describe('In case of there is not matching user', () => {
    it('should not log in user', async () => {
      const dto = new CreateUserDto();
      try {
        await authService.login(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('User not found');
      }
    });

    it('should not refresh token', async () => {
      const dto = new RefreshDto();
      const user = new User();
      try {
        await authService.refresh(dto, user);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid refresh token');
      }
    });

    it('should regiter user', async () => {
      const dto = new CreateUserDto();
      const registerUser = await authService.register(dto);
      expect(registerUser).toHaveProperty('access_token');
    });
  });
});
