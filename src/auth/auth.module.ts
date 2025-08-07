import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { RefreshTokens } from './entity/refresh_token.entity';
import { JwtResetPasswordStrategy } from './strategies/jwt-reset-password-token.strategy';
import { UserRole } from 'src/user_roles/entities/user_role.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { EmailService } from 'src/Utils/EmailService';

@Global()
@Module({
  imports: [
    JwtModule,
    PassportModule,
    TypeOrmModule.forFeature([User, UserRole, Tenant]),
    TypeOrmModule.forFeature([RefreshTokens]),
  ],
  providers: [
    AuthService,
    EmailService,
    UsersService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    JwtResetPasswordStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
