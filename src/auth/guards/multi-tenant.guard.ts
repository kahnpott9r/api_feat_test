import {
  CanActivate,
  ExecutionContext,
  Inject,
  Type,
  mixin,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, ObjectLiteral } from 'typeorm';

import {
  defaultAuthenticationValidation,
  isAdmin,
  isAllowedTenant,
  isAllowedTenantArray,
} from '../../Utils/utils';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { ROLE, UserRole } from '../../user_roles/entities/user_role.entity';
import { User } from '../../users/entities/user.entity';

export enum SECURITY {
  CHECK_PARAM = 'CheckInParam',
  CHECK_BODY = 'CheckInBody',
}

export enum SECURITY_KEY {
  TENANT_ID = 'tenantId',
  PROPERTY_ID = 'propertyId',
  RENTER_IDS = 'renterIds',
  AGREEMENT_ID = 'agreementId',
  ID = 'id',
}

const MultiTenantGuard = (
  entityClass: any,
  checkIn: SECURITY,
  checkParam: SECURITY_KEY,
  allowedRoles: ROLE[],
  isArray = false,
): Type<CanActivate> => {
  class ScopeGuardMixin {
    constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
 
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      let entityId: any;
      if (checkIn == SECURITY.CHECK_PARAM) {
        entityId = request.params[checkParam];
      } else if (checkIn === SECURITY.CHECK_BODY) {
        entityId = request.body[checkParam];
      }

      if (!isArray) {
        const entity = await this.dataSource
          .getRepository(entityClass)
          .findOne({
            where: { id: entityId },
          });

        // console.log(entity);

        if (!entity) {
          throw new NotFoundException(entityClass.name + ' bestaat niet');
        }
        request.params['guard_' + entityClass.name] = entity;

        const validate = defaultAuthenticationValidation(allowedRoles, user);
        if (validate !== undefined) {
          return validate;
        }
        // console.log(entity);
        return isAllowedTenant(
          user.user_roles,
          entityClass === Tenant ? (entity as Tenant) : entity?.tenant,
          allowedRoles,
        );
      } else {
        const entities = [];
        const entitiesMap = entityId.map(async (id) => {
          const entity = await this.dataSource
            .getRepository(entityClass)
            .findOne({
              where: { id },
            });
          entities.push(entity);
        });
        await Promise.all(entitiesMap);

        if (!entities.every((item) => item != null)) {
          throw new NotFoundException(entityClass.name + ' bestaat niet');
        }

        if (entities.length === 0) {
          throw new NotFoundException(entityClass.name + ' bestaat niet');
        }
        request.params['guard_' + entityClass.name + '_array'] = entities;
        const validate = defaultAuthenticationValidation(allowedRoles, user);
        if (validate !== undefined) {
          return validate;
        }
        if (entityClass === Tenant) {
          return isAllowedTenantArray(
            user.user_roles,
            entities as Tenant[],
            allowedRoles,
          );
        } else {
          const tenantArray: Tenant[] = entities.map((item) => item.tenant);

          return isAllowedTenantArray(
            user.user_roles,
            tenantArray,
            allowedRoles,
          );
        }
      }
    }
  }

  return mixin(ScopeGuardMixin);
};
export default MultiTenantGuard;
