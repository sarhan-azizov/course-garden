import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { LoggerService } from '@/modules';

import {
  CustomBusinessException,
  EnumModules,
  ERROR_MESSAGE_KEYS,
  getErrorMessage,
} from '@/common';

import { CoursesService } from '../courses.service';
import { CourseEntity } from '../entities';

import {
  CreateCardRequestDTO,
  CardResponseDTO,
  UpdateCardRequestDTO,
  UpdateCardPositionRequestDTO,
  UpdateCardPositionResponseDTO,
} from './dto';
import { CardEntity } from './entities';

import {
  getCardsForUpdatePosition,
} from './helpers';

@Injectable()
export class CardsService {
  constructor(
    private readonly courseService: CoursesService,
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    private dataSource: DataSource,
    private readonly logger: LoggerService,
  ) { }

  async createCard(
    courseId: string,
    createCardRequestDTO: CreateCardRequestDTO,
    auth0Id: string,
  ): Promise<CardResponseDTO> {
    try {
      const courseEntity: CourseEntity = await this.courseService.getCourseById(
        courseId,
        auth0Id,
      );

      if (createCardRequestDTO.position < 1 || createCardRequestDTO.position > courseEntity.cards.length + 1) {
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.INVALID_POSITION, {
            position: createCardRequestDTO.position,
            length: courseEntity.cards.length + 1,
          }),
          EnumModules.CARDS,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const savedCardEntity = await this.dataSource.transaction(async (manager) => {
        const cardEntity = this.toCardEntity(createCardRequestDTO);

        cardEntity.course = courseEntity;
        cardEntity.user = courseEntity.user;

        const savedCardEntity = await manager.getRepository(CardEntity).save(cardEntity);

        const cardsToUpdate: CardEntity[] = getCardsForUpdatePosition(courseEntity.cards.concat(savedCardEntity), {
          id: savedCardEntity.id,
          position: createCardRequestDTO.position,
        });

        if (cardsToUpdate.length) {
          await manager.getRepository(CardEntity).save(cardsToUpdate);
        }

        return savedCardEntity;
      });

      this.logger.log(`Card created successfully with ID: ${savedCardEntity.id}`, 'CardsService');

      return this.toCardResponseDTO(savedCardEntity);
    } catch (error) {
      this.logger.error('Error creating card', 'CardsService', error);
      throw error;
    }
  }

  async getCards(
    courseId: string,
    auth0Id: string,
  ): Promise<CardResponseDTO[]> {
    try {
      const cardsEntities: CardEntity[] = await this.getCourseCards(courseId, auth0Id);

      this.logger.log(`Cards fetched successfully with ID: ${courseId}`, 'CardsService');

      return this.toCardsResponseDTO(cardsEntities);
    } catch (error) {
      this.logger.error('Error getting cards', 'CardsService', error);
      throw error;
    }
  }

  async updateCard(
    cardId: string,
    updateCardRequestDTO: UpdateCardRequestDTO,
    auth0Id: string,
  ): Promise<CardResponseDTO> {
    try {
      const cardEntity: CardEntity = await this.getCardById(cardId, auth0Id);

      const updatedCourseEntity: CardEntity = {
        ...cardEntity,
        ...updateCardRequestDTO,
      };

      await this.cardRepository.save(updatedCourseEntity);

      this.logger.log(`Card updated successfully with ID: ${cardId}`, 'CardsService');

      return this.toCardResponseDTO(updatedCourseEntity);
    } catch (error) {
      this.logger.error('Error updating card', 'CardsService', error);
      throw error;
    }
  }

  async updateCardPosition(
    courseId: string,
    cardId: string,
    updateCardPositionRequestDTO: UpdateCardPositionRequestDTO,
    auth0Id: string,
  ): Promise<UpdateCardPositionResponseDTO[]> {
    try {
      const cardsEntities: CardEntity[] = await this.getCourseCards(courseId, auth0Id);

      if (updateCardPositionRequestDTO.newPosition < 1 || updateCardPositionRequestDTO.newPosition > cardsEntities.length) {
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.INVALID_POSITION, {
            position: updateCardPositionRequestDTO.newPosition,
            length: cardsEntities.length,
          }),
          EnumModules.CARDS,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const cardsToUpdate: CardEntity[] = getCardsForUpdatePosition(cardsEntities, {
        id: cardId,
        position: updateCardPositionRequestDTO.newPosition,
      });

      if (!cardsToUpdate.length) {
        return [];
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.getRepository(CardEntity).save(cardsToUpdate);
      });

      this.logger.log(`Card position updated successfully with ID: ${cardId}`, 'CardsService');

      return this.toCardPositionResponseDTO(cardsToUpdate);
    } catch (error) {
      this.logger.error('Error updating card position', 'CardsService', error);
      throw error;
    }
  }

  async deleteCard(
    courseId: string,
    cardId: string,
    auth0Id: string,
  ): Promise<{ message: string; statusCode: 200 }> {
    try {
      const courseEntity: CourseEntity = await this.courseService.getCourseById(courseId, auth0Id);
      const cardEntityToDelete: CardEntity | undefined = courseEntity.cards.find(card => card.id === cardId);

      if (!cardEntityToDelete) {
        throw new CustomBusinessException(getErrorMessage(ERROR_MESSAGE_KEYS.NOT_FOUND, { name: 'card', id: cardId }), EnumModules.CARDS, HttpStatus.NOT_FOUND);
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.getRepository(CardEntity).delete(cardId);

        const cardsToUpdate: CardEntity[] = courseEntity.cards.filter(card => card.id !== cardId).map((card, index) => ({
          ...card,
          position: index + 1,
        }));

        if (cardsToUpdate.length) {
          await manager.getRepository(CardEntity).save(cardsToUpdate);
        }
      });

      this.logger.log(`Card deleted successfully with ID: ${cardId}`, 'CardsService');
      return {
        message: `Card with ID ${cardId} successfully deleted`,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error('Error deleting card', 'CardsService', error);
      throw error;
    }
  }

  // Entity methods
  async getCardById(cardId: string, auth0Id: string): Promise<CardEntity> {
    try {
      const cardEntity = await this.cardRepository.findOne({
        where: { id: cardId, user: { auth0Id } },
        relations: ['user', 'course'],
      });

      if (!cardEntity) {
        this.logger.error(`Card not found with ID: ${cardId}`, 'CardsService');
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.NOT_FOUND, {
            name: 'card',
            id: cardId,
          }),
          EnumModules.CARDS,
          HttpStatus.NOT_FOUND,
        );
      }

      return cardEntity;
    } catch (error) {
      this.logger.error('Error getting card', 'CardsService', error);
      throw error;
    }
  }

  async getCourseCards(courseId: string, auth0Id: string): Promise<CardEntity[]> {
    try {
      await this.courseService.checkCourseExist(courseId, auth0Id);

      return this.cardRepository.find({
        where: { course: { id: courseId }, user: { auth0Id } },
        relations: ['user', 'course'],
        order: { position: 'ASC' },
      });
    } catch (error) {
      this.logger.error('Error getting course cards', 'CardsService', error);
      throw error;
    }
  }

  // Auto mapper methods
  private toCardPositionResponseDTO(
    cardEntities: CardEntity[],
  ): UpdateCardPositionResponseDTO[] {
    return this.mapper.mapArray(
      cardEntities,
      CardEntity,
      UpdateCardPositionResponseDTO,
    );
  }

  private toCardResponseDTO(cardEntity: CardEntity): CardResponseDTO {
    return this.mapper.map(cardEntity, CardEntity, CardResponseDTO);
  }

  private toCardsResponseDTO(cardEntities: CardEntity[]): CardResponseDTO[] {
    return this.mapper.mapArray(cardEntities, CardEntity, CardResponseDTO);
  }

  private toCardEntity(createCardRequestDTO: CreateCardRequestDTO) {
    return this.mapper.map(
      createCardRequestDTO,
      CreateCardRequestDTO,
      CardEntity,
    );
  }
}
