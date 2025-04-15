import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { CreateUserRequestDTO, UserResponseDTO } from './dto';
import { UserEntity } from './entities';

@Injectable()
export class UsersMapper extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateUserRequestDTO, UserEntity);
      createMap(mapper, UserEntity, UserResponseDTO);
    };
  }
}
