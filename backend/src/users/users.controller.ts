import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    return this.usersService.getUser(userId);
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string) {
    return this.usersService.getAvatar(userId);
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    return this.usersService.deleteAvatar(userId);
  }
}
