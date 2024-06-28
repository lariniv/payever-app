import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { ResponseRegResDto } from './dto/response-reqres.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import axios from 'axios';
import { ImageDocument, Image } from './schemas/image.schema';
import { SendMailEvent } from './events/send-mail.event';

@Injectable()
export class UsersService {
  constructor(
    @Inject('MAILER_SERVICE') private rabbitClient: ClientProxy,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  async onModuleInit() {
    try {
      await this.rabbitClient.connect();
    } catch (err) {
      throw new Error('Couldn`t connect to RabbitMQ');
    }
  }

  async create(user: CreateUserDto) {
    this.rabbitClient.emit('send_mail', plainToInstance(SendMailEvent, user));

    const hashedPass = await bcrypt.hash(user.password, 10);

    const res = await this.userModel.create({
      ...user,
      password: hashedPass,
    });

    return res;
  }

  async getUser(id: string) {
    const res = await axios.get(`https://reqres.in/api/users/${id}`);

    return plainToInstance(ResponseRegResDto, res.data);
  }

  async getAvatar(id: string) {
    const res = await axios.get(`https://reqres.in/api/users/${id}`);

    const user = plainToInstance(ResponseRegResDto, res.data);

    const existingAvatar = await this.imageModel.findOne({ userId: user.id });

    if (existingAvatar) {
      return existingAvatar.base64;
    }

    const avatar = await axios.get(user.avatar, {
      responseType: 'arraybuffer',
    });
    const base64 = Buffer.from(avatar.data, 'binary').toString('base64');

    const newAvatar = await this.imageModel.create({ base64, userId: user.id });

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

    const buffer = Buffer.from(base64Data, 'base64');

    try {
      fs.writeFileSync(`../avatars/avatar${user.id}.jpg`, buffer);
    } catch (err) {
      throw new Error('Couldn`t write avatar from base64');
    }

    return newAvatar.base64;
  }

  async deleteAvatar(userId: string) {
    const avatar = this.imageModel.findOneAndDelete({ userId });

    try {
      fs.unlinkSync(`../avatars/avatar${userId}.jpg`);
    } catch (err) {
      throw new Error('Couldn`t delete this avatar from fs');
    }

    return avatar;
  }
}
