import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 创建管理员权限
  const adminPerm = await prisma.permission.upsert({
    where: { code: 'user:manage' },
    update: {},
    create: { code: 'user:manage', description: '管理用户' },
  });
  // 创建admin角色，绑定权限
  await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: '超级管理员',
      permissions: { connect: [{ id: adminPerm.id }] },
    },
  });
}
main();
