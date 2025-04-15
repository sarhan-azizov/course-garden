import { createMap, forMember, Mapper, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import {
  CreateCardRequestDTO,
  CardResponseDTO,
  UpdateCardPositionResponseDTO,
} from './dto';
import { CardEntity } from './entities';

@Injectable()
export class CardsMapper extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateCardRequestDTO, CardEntity);
      createMap(
        mapper,
        CardEntity,
        CardResponseDTO,
        forMember(
          (cardResponseDTO: CardResponseDTO) => cardResponseDTO.courseId,
          mapFrom((cardEntity: CardEntity) => cardEntity.course.id),
        ),
        forMember(
          (cardResponseDTO: CardResponseDTO) => cardResponseDTO.creatorId,
          mapFrom((cardEntity: CardEntity) => cardEntity.user.id),
        ),
      );
      createMap(mapper, CardEntity, UpdateCardPositionResponseDTO);
    };
  }
}
