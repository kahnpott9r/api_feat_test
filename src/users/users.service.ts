import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PageOptionsDto } from 'src/pagination/dtos';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { PageDto } from 'src/pagination/page.dto';
import { UserRole } from 'src/user_roles/entities/user_role.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { configQuery, getPaginationKeys } from 'src/Utils/utils';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Agreement } from '../agreements/entities/agreement.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
  ) {}

  async create(
    {
      email,
      password: uncryptedPassword,
      first_name,
      last_name,
      avatar,
      tenantId,
      role,
    }: CreateUserDto,
    global: string | null = null,
  ): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException(i18nValidationMessage('message.EmailUsed'));
    }

    const password = await argon2.hash(uncryptedPassword);

    const user = this.usersRepository.create({
      email,
      password,
      user_info: { first_name, last_name, avatar },
    });

    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Klant bestaat niet');
    }

    const newUser = await this.usersRepository.save(user);
    if (global !== 'true') {
      const userRole = this.userRoleRepository.create({
        user,
        tenant,
        role: role,
      });

      await this.userRoleRepository.save(userRole);
    }
    return newUser;
  }

  async configRelative(queryBuilder: SelectQueryBuilder<User>) {
    return queryBuilder
      .leftJoinAndSelect('users.user_info', 'user_info')
      .leftJoinAndSelect('users.user_roles', 'user_role')
      .leftJoinAndSelect('user_role.tenant', 'tenant');
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.usersRepository.createQueryBuilder('users');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.tenantRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'users',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.tenantRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getUserCountByTenant(tenantId: number): Promise<number> {
    const queryBuilder = this.userRoleRepository.createQueryBuilder('userRole');
    return await queryBuilder
      .innerJoin('userRole.user', 'user')
      .innerJoin('userRole.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId })
      .getCount();
  }

  async getUsersByTenant(pageOptionsDto: PageOptionsDto, tenantId: number) {
    const queryBuilder = this.usersRepository.createQueryBuilder('users');
    let query = await this.configRelative(queryBuilder);

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.tenantRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = await configQuery(
      'users',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.tenantRepository.metadata,
      query,
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    query = await query.offset(PageOptionsDto.skip(pageOptionsDto));
    query = await query.limit(pageOptionsDto.take);

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getUserTenants(id: number) {
    const queryBuilder = this.usersRepository.createQueryBuilder('users');
    let query = await queryBuilder
      .leftJoinAndSelect('users.user_roles', 'user_role')
      .leftJoinAndSelect('user_role.tenant', 'tenant');
    query = query.andWhere('users.id = :userId', { userId: id });
    const user = await query.getOne();
    return user;
  }

  findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id: id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDetailDto) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new NotFoundException('Gebruiker bestaat niet');
    }
    user.user_info.first_name = updateUserDto.first_name;
    user.user_info.last_name = updateUserDto.last_name;
    user.user_info.avatar = updateUserDto.avatar;
    return user.save();
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new NotFoundException('Gebruiker bestaat niet');
    }
    await UserRole.delete({
      user: { id },
    });
    await this.usersRepository.delete(id);

    return 'User was deleted.';
  }

  async updatePasswordById(
    id: number,
    uncryptedPassword: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });
    const password = await argon2.hash(uncryptedPassword);
    user.password = password;
    return user.save();
  }

  async updatePassword(user: User, uncryptedPassword: string): Promise<User> {
    const password = await argon2.hash(uncryptedPassword);
    user.password = password;
    return user.save();
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['user_roles.tenant'],
    });
  }
}
