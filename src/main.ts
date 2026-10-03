import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //自动剥离dto中未声明的属性
      forbidNonWhitelisted: true, //请求包含未声明的属性，返回400
      transform: true, //自动将普通对象转化为dto实例
    }),
  );

  ConfigModule.forRoot({
    isGlobal: true,
    validate: (config: Record<string, unknown>) => {
      const required = ['JWT_SECRET'];
      for (const key of required) {
        if (!config[key]) {
          throw new Error(`Missing required env var: ${key}`);
        }
      }
      return config;
    },
  });
  // 全局路由前缀，例如 /api/v1
  app.setGlobalPrefix('api/v1');

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('后台管理API')
      .setDescription('Nest+Prisma+JWT 后端接口文档')
      .setVersion('1.0.0')
      .addBearerAuth() // 增加JWT授权框（对应@ApiBearerAuth）
      .build();

    // 生成openapi文档对象
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    // 访问地址：http://localhost:3000/api/v1/docs
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
