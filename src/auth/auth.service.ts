import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });
    if (existUser) throw new BadRequestException('用户名已存在');

    const existEmail = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (existEmail) throw new BadRequestException('邮箱已存在');

    const hashPwd = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashPwd,
      },
    });
    const { password, ...userRest } = user;
    return userRest;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
    if (!user) throw new BadRequestException('用户不存在');

    const right = await bcrypt.compare(dto.password, user.password);
    if (!right) throw new BadRequestException('密码错误');

    const payload = this.jwt.sign({
      sub: user.id,
      username: user.username,
    });

    return {
      access_token: payload,
    };
  }
}
