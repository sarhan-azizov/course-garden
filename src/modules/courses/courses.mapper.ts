import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import {
  CreateCourseRequestDTO,
  CourseResponseDTO,
  CourseDetailsResponseDTO,
  ExportCourseResponseDTO,
  ImportCourseRequestDTO, 
  ImportCourseResponseDTO,
} from './dto';

import { CreateCardRequestDTO, CardResponseDTO } from './cards/dto';
import { CardEntity } from './cards/entities';

import { CourseEntity } from './entities';

@Injectable()
export class CoursesMapper extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CardEntity, CreateCardRequestDTO);
      createMap(
        mapper,
        CourseEntity,
        ExportCourseResponseDTO,
        forMember(
          (exportCourseResponseDTO: ExportCourseResponseDTO) => exportCourseResponseDTO.cards,
          mapFrom((courseEntity) => mapper.mapArray(
            courseEntity.cards,
            CardEntity,
            CreateCardRequestDTO
          ))
        )
      );
      createMap(
        mapper,
        CourseEntity,
        ImportCourseResponseDTO,
        forMember(
          (importCourseResponseDTO: ImportCourseResponseDTO) => importCourseResponseDTO.cards,
          mapFrom((courseEntity) => mapper.mapArray(
            courseEntity.cards,
            CardEntity,
            CardResponseDTO
          ))
        )
      );
      createMap(mapper, CreateCourseRequestDTO, CourseEntity);
      createMap(
        mapper,
        CourseEntity,
        CourseDetailsResponseDTO,
        forMember(
          (courseResponseDTO: CourseResponseDTO) => courseResponseDTO.creatorId,
          mapFrom((entity) => entity.user.id),
        ),
        forMember(
          (courseResponseDTO: CourseResponseDTO) =>
            courseResponseDTO.activeCardsCount,
          mapFrom(
            (entity) =>
              (entity.cards || []).filter((card) => card.isActive).length,
          ),
        ),
        forMember(
          (courseResponseDTO: CourseResponseDTO) =>
            courseResponseDTO.draftCardsCount,
          mapFrom(
            (entity) =>
              (entity.cards || []).filter((card) => !card.isActive).length,
          ),
        ),
        forMember(
          (courseDetailsResponseDTO: CourseDetailsResponseDTO) =>
            courseDetailsResponseDTO.cards,
          mapFrom((courseEntity: any) => {
            return courseEntity.cards;
          }),
        ),
      );
      createMap(
        mapper,
        CourseEntity,
        CourseResponseDTO,
        forMember(
          (courseResponseDTO: CourseResponseDTO) => courseResponseDTO.creatorId,
          mapFrom((entity) => entity.user.id),
        ),
        forMember(
          (courseResponseDTO: CourseResponseDTO) =>
            courseResponseDTO.activeCardsCount,
          mapFrom(
            (entity) =>
              (entity.cards || []).filter((card) => card.isActive).length,
          ),
        ),
        forMember(
          (courseResponseDTO: CourseResponseDTO) =>
            courseResponseDTO.draftCardsCount,
          mapFrom(
            (entity) =>
              (entity.cards || []).filter((card) => !card.isActive).length,
          ),
        ),
      );
    };
  }
}
