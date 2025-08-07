import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { ROLE, UserRole } from '../../user_roles/entities/user_role.entity';

export const RoleGuard = (roles: ROLE[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
 
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      return user.user_roles.some((userRole: UserRole) =>
        roles.includes(userRole.role),
      );
    }
  }
  return mixin(RoleGuardMixin);
};
