import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import {
  CustomBusinessException,
  EnumModules,
  ERROR_MESSAGE_KEYS,
  getErrorMessage,
} from '@/common';

import { CreateUserRequestDTO, UserResponseDTO, LoggerService } from '@/modules';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private logger: LoggerService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Authorise a user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 201,
    description: 'Returns an authorized user data',
    type: UserResponseDTO,
  })
  @UseGuards(AuthGuard('jwt'))
  getProtectedData(
    @Req() req: Request & { user: { sub: string } },
    @Body() data: CreateUserRequestDTO,
  ): Promise<UserResponseDTO> {
    if (req.user.sub !== data.auth0Id) {
      this.logger.error('Invalid token', 'AuthController');
      throw new CustomBusinessException(
        getErrorMessage(ERROR_MESSAGE_KEYS.INVALID_TOKEN),
        EnumModules.AUTH,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.authService.auth(data);
  }
}
