import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AppService {
  sendMail(data: UserDto) {
    console.log('Successfully sent mail to: ', data.email);
  }
}
