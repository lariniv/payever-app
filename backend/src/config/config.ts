import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { validate } from './utils';

class MainConfig {
  @Expose()
  @IsString()
  MONGODB_URI: string;
}

export default registerAs('config', () => {
  return validate(MainConfig);
});
