import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Image } from './schemas/image.schema';
import { modelMock } from '../db/model.mock';
import axios from 'axios';
import * as fs from 'fs';
import { Model } from 'mongoose';

jest.mock('axios');
describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<User>;
  let imageModel: Model<Image>;

  const mockMailerService = {
    emit: jest.fn(),
  };

  const reqResMockData = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    avatar: 'https://reqres.in/img/faces/1-image.jpg',
  };

  const reqResResponse = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://reqres.in/img/faces/1-image.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: modelMock,
        },
        {
          provide: getModelToken(Image.name),
          useValue: modelMock,
        },
        { provide: 'MAILER_SERVICE', useValue: mockMailerService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    imageModel = module.get<Model<Image>>(getModelToken(Image.name));
  });

  afterEach(async () => {
    try {
      fs.unlinkSync('../avatars/avatar1.jpg');
    } catch (e) {}
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should create user', async () => {
    const user = { name: 'John', email: 'bob@gmail.com', password: '123456' };
    const mockUser = { _id: '123', ...user };
    (userModel.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await usersService.create(user);

    expect(result).toEqual(mockUser);
  });

  it('should get user', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        data: reqResMockData,
      },
    });

    const result = await usersService.getUser('1');

    expect(result).toEqual(reqResResponse);
  });

  it('should fetch and save new avatar if not found in database', async () => {
    (imageModel.findOne as jest.Mock).mockResolvedValue(null);
    (imageModel.create as jest.Mock).mockResolvedValue({
      base64: 'base64',
    });

    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({
        data: {
          data: reqResMockData,
        },
      })
      .mockResolvedValueOnce({
        data: Buffer.from('mock-image-data'),
      });

    jest.spyOn(fs, 'writeFileSync');

    const result = await usersService.getAvatar('1');

    expect(result).toEqual('base64');
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it('should delete avatar', async () => {
    (imageModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);
    (imageModel.create as jest.Mock).mockResolvedValue({
      base64: 'new-base64',
    });

    jest.spyOn(fs, 'unlinkSync');

    fs.writeFileSync('../avatars/avatar1.jpg', 'mock-image-data');

    const result = await usersService.deleteAvatar('1');

    expect(result).toBeNull();
    expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
  });
});
