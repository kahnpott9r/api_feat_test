import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { CreateUserRoleDto } from './dto/create-user_role.dto';
import { UpdateUserRoleDto } from './dto/update-user_role.dto';
import { ROLE, UserRole } from './entities/user_role.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { configQuery, getPaginationKeys, isAdmin } from 'src/Utils/utils';
import { PageOptionsDto } from '../pagination/dtos';
import { PageMetaDto } from '../pagination/page-meta.dto';
import { PageDto } from '../pagination/page.dto';
import { I18nService, i18nValidationMessage } from 'nestjs-i18n';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private readonly i18n: I18nService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createUserRoleDto: CreateUserRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: createUserRoleDto.userId },
    });
    if (!user) {
      throw new NotFoundException('Gebruiker bestaat niet');
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: createUserRoleDto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Klant bestaat niet');
    }

    const alreadyRole = await this.userRoleRepository.find({
      where: {
        user: {
          id: user.id,
        },
        tenant: {
          id: tenant.id,
        },
      },
    });
    if (alreadyRole.length > 0) {
      throw new UnprocessableEntityException(this.i18n.t('message.EmailUsed'));
    }

    const userRole = this.userRoleRepository.create({
      user,
      tenant,
      role: createUserRoleDto.role,
    });
    await this.userRoleRepository.save(userRole);
    return 'UserRole Created';
  }

  async configRelative(queryBuilder: SelectQueryBuilder<UserRole>) {
    return queryBuilder
      .leftJoinAndSelect('user_role.user', 'user')
      .leftJoinAndSelect('user_role.tenant', 'tenant');
  }

  async findAll() {
    const queryBuilder =
      this.userRoleRepository.createQueryBuilder('user_role');
    const query = await this.configRelative(queryBuilder);

    return await query.getMany();
  }

  async findByUser(userId: number) {
    const queryBuilder =
      this.userRoleRepository.createQueryBuilder('user_role');
    const query = await this.configRelative(queryBuilder);
    query.andWhere('user.id = :userId', { userId: userId });

    return await query.getMany();
  }

  findOne(id: number) {
    return this.userRoleRepository.findOne({
      where: { id: id },
    });
  }

  async update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: updateUserRoleDto.userId },
    });
    if (!user) {
      throw new NotFoundException('Gebruiker bestaat niet');
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: updateUserRoleDto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Klant bestaat niet');
    }

    const userRole = await this.userRoleRepository.findOne({
      where: { id: id },
    });
    if (!userRole) {
      const userRole = this.userRoleRepository.create({
        user,
        tenant,
      });
      await this.userRoleRepository.save(userRole);
    }
    return 'UserRole Updated';
  }

  async remove(id: number) {
    const user = await this.userRoleRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new NotFoundException('Gebruikers rol bestaat niet');
    }
    await this.userRoleRepository.delete(id);
    return 'UserRole was deleted.';
  }

  async getUserRolesByTenant(
    pageOptionsDto: PageOptionsDto,
    tenantId: number,
    user: User,
  ) {
    const queryBuilder =
      this.userRoleRepository.createQueryBuilder('user_role');
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

    if (!isAdmin(user.user_roles)) {
      query = query.andWhere('user_role.role != :role', { role: ROLE.ADMIN });
    }

    query = await query.offset(PageOptionsDto.skip(pageOptionsDto));
    query = await query.limit(pageOptionsDto.take);

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }
}
