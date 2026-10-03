import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class RbacPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 从路由元数据读取接口需要的权限列表
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果接口没有标记权限，默认放行
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 获取请求对象，拿到JwtAuthGuard挂载到request上的当前登录用户
    const req = context.switchToHttp().getRequest();
    const loginUser = req.user;

    if (!loginUser?.permissions) {
      throw new ForbiddenException('无权限访问该接口');
    }

    // 判断：用户权限数组是否包含接口要求的全部权限（与关系）
    const hasAllPermission = requiredPermissions.every((p) =>
      loginUser.permissions.includes(p),
    );
    if (!hasAllPermission) {
      throw new ForbiddenException('权限不足');
    }
    return hasAllPermission;
  }
}
