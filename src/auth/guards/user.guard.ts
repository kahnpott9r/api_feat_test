import {
  CanActivate,
  ExecutionContext,
  Inject,
  Type,
  mixin,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
  defaultAuthenticationValidation,
  isAllowedUser,
} from '../../Utils/utils';
import { SECURITY, SECURITY_KEY } from './multi-tenant.guard';
import { User } from 'src/users/entities/user.entity';
import { ROLE } from '../../user_roles/entities/user_role.entity';

const UserGuard = (
  checkIn,
  checkParam = SECURITY_KEY.ID,
  allowedRoles: ROLE[],
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
      const entity = await this.dataSource.getRepository(User).findOne({
        where: { id: entityId },
      });

      if (!entity) {
        throw new NotFoundException(User.name + ' bestaat niet');
      }

      request.params['guard_' + User.name] = entity;
      const validate = defaultAuthenticationValidation(allowedRoles, user);
      if (validate !== undefined) {
        return validate;
      }
      if (user.id === entity.id) {
        return true;
      }

      return isAllowedUser(user.user_roles, entity?.user_roles);
    }
  }
  return mixin(ScopeGuardMixin);
};
export default UserGuard;
