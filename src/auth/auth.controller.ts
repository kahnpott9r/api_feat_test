import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { PublicDecorator } from './decorators/public.decorator';
import { RefreshDto } from './dto/refresh.dto';
import { User } from '../users/entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot_password.dto';
import { ResetPasswordDto } from './dto/reset_password.dto';
import { JwtResetPasswordTokenGuard } from './guards/jwt-rest-password-token.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { isAdmin, isManager } from '../Utils/utils';
import { ROLE } from '../user_roles/entities/user_role.entity';

@ApiTags('Authentication')
@PublicDecorator()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @ApiOperation({ description: 'Register' })
  // @Post('register')
  // async register(@Body() body: CreateUserDto, @GetUser() user: User) {
  //   if (isManager(user?.user_roles) && body.role == ROLE.ADMIN) {
  //     throw new ForbiddenException('Forbidden');
  //   }
  //   if (!isAdmin(user?.user_roles) && !isManager(user?.user_roles)) {
  //     throw new ForbiddenException('Forbidden');
  //   }
  //   return await this.authService.register(body);
  // }

  @ApiOperation({ description: 'Login' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @ApiOperation({ description: 'Forgot password-Request send email' })
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.sendResetPasswordEmail(body);
  }

  @ApiOperation({ description: 'Reset password' })
  @UseGuards(JwtResetPasswordTokenGuard)
  @Post('reset-password')
  async resetPassword(@GetUser() user: User, @Body() body: ResetPasswordDto) {
    console.log('Checked user : ', user);
    return await this.authService.resetPassword(user, body);
  }

  @ApiOperation({ description: 'Refresh' })
  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh')
  async refresh(@GetUser() user: User, @Body() token: RefreshDto) {
    return await this.authService.refresh(token, user);
  }
}
