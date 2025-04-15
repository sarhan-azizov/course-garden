import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersMapper } from './users.mapper';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService, UsersMapper],
  exports: [UsersService],
})
export class UserModule {}
