import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectMapper } from '@automapper/nestjs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserResponseDTO } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'get users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 200,
    description: 'Return users',
    type: UserResponseDTO,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getUsers(): Promise<UserResponseDTO[]> {
    return await this.usersService.getUsers();
  }
}
