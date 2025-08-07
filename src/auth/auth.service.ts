import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';
import { JwtPayload } from './interface/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { RefreshTokens } from './entity/refresh_token.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot_password.dto';
import { ResetPasswordDto } from './dto/reset_password.dto';
import { EmailService } from 'src/Utils/EmailService';
import { i18nValidationMessage } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(RefreshTokens)
    private refreshTokenRepository: Repository<RefreshTokens>,
  ) {}

  async login(signInUser: LoginDto) {
    const user = await this.validateUser(signInUser);

    const { access_token, refresh_token } = await this.generateAndUpdateTokens(
      user,
    );

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);

    const user = await this.usersService.findByEmail(createUserDto.email);

    const { access_token, refresh_token } = await this.generateAndUpdateTokens(
      user,
    );
    return {
      access_token,
      refresh_token,
      user,
    };
  }

  async refresh({ refresh_token }: RefreshDto, user: User) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { user: { id: user.id }, refresh_token },
    });
    if (!refreshToken) {
      throw new BadRequestException(
        i18nValidationMessage('message.InvalidRefresh'),
      );
    }

    const { access_token, refresh_token: new_refresh_token } =
      await this.generateAndUpdateTokens(user);
    await this.refreshTokenRepository.delete(refreshToken.id);
    const tenantUser = await this.usersService.findByEmail(user.email);
    return {
      access_token,
      refresh_token: new_refresh_token,
      user: tenantUser,
    };
  }

  async sendResetPasswordEmail({
    email,
    domain,
  }: ForgotPasswordDto): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Code bestaat niet');
    }
    const reset_token = await this.getResetToken(user);
    const link = `${domain}/auth/reset-password?token=${reset_token}`;
    const sendResult = await this.emailService.sendEmail(
      email,
      'Wachtwoord vergeten',
      'Herstel a.u.b je wachtwoord',
      { reset_url: link },
      this.configService.get('SEND_GRID_DYNAMIC_RESET_PASSWORD_TEMPLATE'),
    );
    if (sendResult) {
      return 'Email was Sent. Please check your email.';
    } else {
      throw new NotFoundException('Er ging iets mis met het versturen');
    }
  }

  async resetPassword(user: User, { password }: ResetPasswordDto) {
    return await this.usersService.updatePassword(user, password);
  }

  async validateUser({ email, password }: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Gebruiker niet gevonden');
    }
    const match = await argon2.verify(user.password, password);
    if (!match) {
      throw new UnauthorizedException('Ongeldig wachtwoord');
    }

    return user;
  }

  async generateAndUpdateTokens(
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const jwt_payload = {
      email: user.email,
      sub: user.id,
    } as JwtPayload;

    const access_token = await this.getAccessToken(jwt_payload);
    const refresh_token = await this.getRefreshToken(jwt_payload);

    await this.updateRefreshTokenInUser(refresh_token, user);

    return {
      access_token,
      refresh_token,
    };
  }

  async updateRefreshTokenInUser(refreshToken: string, user: User) {
    const { exp } = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });

    const refresh = this.refreshTokenRepository.create({
      valid_until: new Date(exp * 1000),
      refresh_token: refreshToken,
      user,
    });
    return this.refreshTokenRepository.save(refresh);
  }

  async getAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '86400s',
    });
  }

  async getResetToken(user: User) {
    const jwt_payload = {
      email: user.email,
      sub: user.id,
    } as JwtPayload;
    return this.jwtService.sign(jwt_payload, {
      secret: this.configService.get('RESET_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('RESET_TOKEN_EXPIRATION')}`,
    });
  }

  async getRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('REFRESH_TOKEN_EXPIRATION')}`,
    });
  }
}
