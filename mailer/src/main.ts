import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigType } from '@nestjs/config';
import rabbitmq from './config/rabbitmq';
import { MAILER_QUEUE_NAME } from './utils/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rabbitConfig = app.get<ConfigType<typeof rabbitmq>>(rabbitmq.KEY);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        {
          username: rabbitConfig.RMQ_USERNAME,
          password: rabbitConfig.RMQ_PASSWORD,
          hostname: rabbitConfig.RMQ_HOST,
          port: rabbitConfig.RMQ_PORT,
        },
      ],
      queue: MAILER_QUEUE_NAME,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
