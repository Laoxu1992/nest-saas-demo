import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
