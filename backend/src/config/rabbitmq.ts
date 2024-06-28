import { registerAs } from '@nestjs/config';
import { IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { validate } from './utils';

class RabbitMQConfig {
  @Expose()
  @IsString()
  RMQ_HOST: string;

  @Expose()
  @IsNumber()
  RMQ_PORT: number;

  @Expose()
  @IsString()
  RMQ_USERNAME: string;

  @Expose()
  @IsString()
  RMQ_PASSWORD: string;
}

export default registerAs('rabbitmq', () => {
  return validate(RabbitMQConfig);
});
