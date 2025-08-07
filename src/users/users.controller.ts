import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { PageOptionsDto } from 'src/pagination/dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/Utils/S3Service.service';
import { EmailCheckDto } from './dto/email-check.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { UpdateUserSecurityDto } from './dto/update-user-security.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { ROLE } from 'src/user_roles/entities/user_role.entity';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from 'src/auth/guards/multi-tenant.guard';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { isAdmin, isManager } from 'src/Utils/utils';
import UserGuard from 'src/auth/guards/user.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_BODY, SECURITY_KEY.TENANT_ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  create(
    @Body() createUserDto: CreateUserDto,
    @Param('guard_Tenant') tenant: Tenant,
    @GetUser() user: User,
    @Query('global') global: string | null,
  ): Promise<User> {
    if (createUserDto.role == ROLE.ADMIN && !isAdmin(user.user_roles)) {
      throw new ForbiddenException('You can not create user with this role');
    }
    if (global === 'true' && !isAdmin(user.user_roles)) {
      throw new ForbiddenException('You can not create global user');
    }
    return this.usersService.create(createUserDto, global);
  }

  @Get()
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.usersService.findAll(pageOptionsDto);
  }

  @Get(':id')
  @UseGuards(
    UserGuard(SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get(':id/tenants')
  @UseGuards(
    UserGuard(SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  GetUserTenants(@Param('id') id: string) {
    return this.usersService.getUserTenants(+id);
  }

  @Patch(':id/detail')
  @UseGuards(
    UserGuard(SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDetailDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch(':id/security')
  @UseGuards(
    MultiTenantGuard(User, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  updatePassword(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserSecurityDto,
  ) {
    return this.usersService.updatePasswordById(+id, updateUserDto.password);
  }

  @Delete(':id')
  @UseGuards(RoleGuard([ROLE.ADMIN]))
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('files')
  @UseGuards(ThrottlerGuard)
  @UseInterceptors(FileInterceptor('image'))
  uploadFile(@UploadedFile() image) {
    return this.s3Service.uploadFile(image);
  }

  @Post('email_check')
  @UseGuards(RoleGuard([ROLE.ADMIN, ROLE.MANAGER]))
  async emailCheck(
    @Body() emailCheckDto: EmailCheckDto,
  ): Promise<Pick<User, 'id' | 'email'>> {
    const user = await this.usersService.findByEmail(emailCheckDto.email);
    return {
      id: user?.id,
      email: user?.email,
    };
  }
}
