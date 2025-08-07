import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../user_roles/entities/user_role.entity';

export const GetUserRoles = createParamDecorator(
  (data, ctx: ExecutionContext): UserRole[] => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    return user.user_roles.map((user_role: UserRole) => user_role);
  },
);
