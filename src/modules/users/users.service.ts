import { InjectMapper } from '@automapper/nestjs';
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mapper } from '@automapper/core';

import {
  CustomBusinessException,
  EnumModules,
  ERROR_MESSAGE_KEYS,
  getErrorMessage,
} from '@/common';

import { LoggerService } from '@/modules';

import { CreateUserRequestDTO, UserResponseDTO } from './dto';
import { UserEntity } from './entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly logger: LoggerService,
  ) {}

  async createUser(
    createUserRequestDTO: CreateUserRequestDTO,
  ): Promise<UserResponseDTO> {
    try {
      const userEntity = await this.checkUserExist(createUserRequestDTO.auth0Id);

      if (userEntity) {
        this.logger.log(`User already exists with ID: ${createUserRequestDTO.auth0Id}`, 'UsersService');
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.ALREADY_EXISTS, {
            name: 'user',
            id: createUserRequestDTO.auth0Id,
          }),
          EnumModules.USERS,
          HttpStatus.CONFLICT,
        );
      }

      const newUserEntity = this.toUserEntity(createUserRequestDTO);
      const createdUserEntity = await this.usersRepository.save(newUserEntity);

      this.logger.log(`User created successfully with ID: ${createdUserEntity.auth0Id}`, 'UsersService');

      return this.toUserResponseDTO(newUserEntity);
    } catch (error) {
      this.logger.error('Error creating user', 'UsersService', error);
      throw error;
    }
  }

  async findOrCreate(
    createUserRequestDTO: CreateUserRequestDTO,
  ): Promise<UserResponseDTO> {
    const userEntity = await this.checkUserExist(createUserRequestDTO.auth0Id);

    if (!userEntity) {
      this.logger.log(`User not found with ID: ${createUserRequestDTO.auth0Id}, creating new user`, 'UsersService');
      return this.createUser(createUserRequestDTO);
    }

    return this.toUserResponseDTO(userEntity);
  }

  async getUser(auth0Id: string): Promise<UserResponseDTO> {
    try {
     const userEntity = await this.checkUserExist(auth0Id);
  
      if (!userEntity) {
        this.logger.error(`User not found with ID: ${auth0Id}`, 'UsersService');
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.NOT_FOUND, {
            name: 'user',
            id: auth0Id,
          }),
          EnumModules.USERS,
          HttpStatus.NOT_FOUND,
        );
      }
  
      this.logger.log(`User found successfully with ID: ${auth0Id}`, 'UsersService'); 
  
      return this.toUserResponseDTO(userEntity);
    } catch (error) {
      this.logger.error('Error getting user', 'UsersService', error);
      throw error;
    }
  }

  async getUsers(): Promise<UserResponseDTO[]> {
    try {
      const usersEntity: UserEntity[] = await this.usersRepository.find({});

      this.logger.log(`Found ${usersEntity.length} users`, 'UsersService');
      
      return this.toUsersResponseDTO(usersEntity);
    } catch (error) {
      this.logger.error('Error getting users', 'UsersService', error);
      throw error;
    }
  }

  // Entity methods
  async checkUserExist(auth0Id: string): Promise<UserEntity> {
    const userEntity = await this.usersRepository.findOne({
      where: { auth0Id },
    });

    if (!userEntity) {
      this.logger.error(`User not found with ID: ${auth0Id}`, 'UsersService');
      throw new CustomBusinessException(
        getErrorMessage(ERROR_MESSAGE_KEYS.NOT_FOUND, {
          name: 'user',
          id: auth0Id,
        }),
        EnumModules.USERS,
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`User found successfully with ID: ${auth0Id}`, 'UsersService');

    return userEntity;
  }

  // Private Auto mapper methods
  private toUserResponseDTO(userEntity: UserEntity): UserResponseDTO {
    return this.mapper.map(userEntity, UserEntity, UserResponseDTO);
  }

  private toUsersResponseDTO(userEntities: UserEntity[]): UserResponseDTO[] {
    return this.mapper.mapArray(userEntities, UserEntity, UserResponseDTO);
  }

  private toUserEntity(createUserRequestDTO: CreateUserRequestDTO): UserEntity {
    return this.mapper.map(
      createUserRequestDTO,
      CreateUserRequestDTO,
      UserEntity,
    );
  }
}
