import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Image, ImageSchema } from './schemas/image.schema';
import { ConfigType } from '@nestjs/config';
import rabbitmq from '../config/rabbitmq';
import { MAILER_QUEUE_NAME } from 'src/utils/constants';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'MAILER_SERVICE',
      useFactory: (rabbitConfig: ConfigType<typeof rabbitmq>) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            queueOptions: {
              durable: false,
            },
            queue: MAILER_QUEUE_NAME,
            urls: [
              {
                hostname: rabbitConfig.RMQ_HOST,
                username: rabbitConfig.RMQ_USERNAME,
                password: rabbitConfig.RMQ_PASSWORD,
                port: rabbitConfig.RMQ_PORT,
              },
            ],
          },
        });
      },
      inject: [rabbitmq.KEY],
    },
  ],
})
export class UsersModule {}
