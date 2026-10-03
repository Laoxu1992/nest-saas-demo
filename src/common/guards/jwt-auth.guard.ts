import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 校验完成后回调，可以拿到解析后的用户信息
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('token无效或已过期');
    }
    return user;
  }
}
