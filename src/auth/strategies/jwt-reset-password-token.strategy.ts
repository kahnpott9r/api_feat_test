import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { JwtPayload } from '../interface/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtResetPasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-reset-password-token',
) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('RESET_TOKEN_SECRET'),
    });
  }

  async validate({ email }: JwtPayload) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
