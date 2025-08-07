import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { JwtPayload } from '../interface/jwt-payload.interface';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET'),
    });
  }

  async validate(jwtPayload: JwtPayload) {
    const { sub } = jwtPayload;
    const user = await this.usersRepository.findOne({
      where: { id: sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
