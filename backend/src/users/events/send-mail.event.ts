import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';

export class SendMailEvent {
  @IsString()
  readonly email: string;

  @IsString()
  readonly name: string;

  @Exclude()
  readonly password: string;
}
