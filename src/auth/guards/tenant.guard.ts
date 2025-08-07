import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { isAdmin } from 'src/Utils/utils';
import { ROLE, UserRole } from '../../user_roles/entities/user_role.entity';

export const TenantGuard = (): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    
    canActivate(context: ExecutionContext) {
 
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const tenantParamId = request.params.tenant;
      if (isAdmin(user.user_roles)) {
        return true;
      }
      return user.user_roles.some(
        (userRole: UserRole) => userRole.tenant.id == tenantParamId,
      );
    }
  }
  return mixin(RoleGuardMixin);
};
