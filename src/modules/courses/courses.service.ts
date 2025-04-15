import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { UserService, LoggerService } from '@/modules';

import {
  EnumModules,
  CustomBusinessException,
  getErrorMessage,
  ERROR_MESSAGE_KEYS,
} from '@/common';

import {
  CreateCourseRequestDTO,
  CourseResponseDTO,
  CourseResponseListDTO,
  UpdateCourseDTO,
  CourseDetailsResponseDTO,
  ExportCourseResponseDTO,
  ImportCourseRequestDTO,
  ImportCourseResponseDTO,
} from './dto';

import { CardEntity } from './cards/entities';
import { CourseEntity } from './entities';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectRepository(CourseEntity)
    private courseRepository: Repository<CourseEntity>,
    private readonly logger: LoggerService,
    @Inject(DataSource)
  private dataSource: DataSource,
  ) {}

  async createCourse(
    createCourseRequestDTO: CreateCourseRequestDTO,
    auht0Id: string,
  ): Promise<CourseResponseDTO> {
    try {
      const userEntity = await this.userService.checkUserExist(auht0Id);

      const courseEntity = this.toCourseEntity(createCourseRequestDTO);
      courseEntity.user = userEntity;

      const savedCourseEntity = await this.courseRepository.save(courseEntity);
      
      this.logger.log(`Course created successfully with ID: ${savedCourseEntity.id}`, 'CourseService');

      return this.toCourseResponseDTO(savedCourseEntity);
    } catch (error) {
      this.logger.error('Error creating course', 'CourseService', error);
      throw error;
    }
  }

  async getCourse(
    courseId: string,
    auth0Id: string,
  ): Promise<CourseDetailsResponseDTO> {
    const courseEntity: CourseEntity = await this.getCourseById(
      courseId,
      auth0Id,
    );

    this.logger.log(`Course details fetched successfully with ID: ${courseId}`, 'CourseService');

    return this.toCourseDetailsResponseDTO(courseEntity);
  }

  async updateCourse(
    courseId: string,
    updateCourseDTO: UpdateCourseDTO,
    auth0Id: string,
  ): Promise<CourseResponseDTO> {
    try {
      const courseEntity: CourseEntity = await this.getCourseById(
        courseId,
        auth0Id,
      );
  
      const updatedCourseEntity = {
        ...courseEntity,
        title: updateCourseDTO.title || courseEntity.title,
        description: updateCourseDTO.description || courseEntity.description,
        isPublic: updateCourseDTO.isPublic || courseEntity.isPublic,
        isActive: updateCourseDTO.isActive || courseEntity.isActive,
      };
  
      await this.courseRepository.save(updatedCourseEntity);
      
      this.logger.log(`Course ${courseId} updated successfully`, 'CourseService');
  
      return this.toCourseResponseDTO(updatedCourseEntity);
    } catch (error) {
      this.logger.error('Error updating course', 'CourseService', error);
      throw error;
    }
  }

  async exportCourse(
    courseId: string,
    auth0Id: string,
  ): Promise<ExportCourseResponseDTO> {
    const courseEntity: CourseEntity = await this.getCourseById(courseId, auth0Id);

    return this.toExportCourseResponseDTO(courseEntity);
  } 

  async importCourse(
    courseImportExportDTO: ImportCourseRequestDTO,
    auth0Id: string,
  ): Promise<ImportCourseResponseDTO> {
    try {
      const userEntity = await this.userService.checkUserExist(auth0Id);

      const courseEntity = this.toCourseEntity(courseImportExportDTO);
      courseEntity.user = userEntity;

      const savedCourseEntity = await this.dataSource.transaction(async (manager) => {
        const savedCourse = await manager.save(CourseEntity, courseEntity);
  
        if (courseImportExportDTO.cards?.length) {
          const cards = courseImportExportDTO.cards.map((card, idx) => ({
            ...card,
            user: userEntity,
            position: idx + 1,
            course: savedCourse
          }));

          const savedCards = await manager.save(CardEntity, cards);

          savedCourse.cards = savedCards;
        }
  
        return savedCourse;
      });

      this.logger.log(`Course created successfully with ID: ${savedCourseEntity.id}`, 'CourseService');

      return this.toImportCourseResponseDTO(courseEntity);
    } catch (error) {
      this.logger.error('Error importing course', 'CourseService', error);
      throw error;
    }
  }

  async deleteCourse(
    courseId: string,
    auth0Id: string,
  ): Promise<{ message: string; statusCode: 200 }> {
    try {
      await this.checkCourseExist(courseId, auth0Id);

      await this.courseRepository.delete(courseId);
      
      this.logger.log(`Course ${courseId} deleted successfully`, 'CourseService');

      return {
        message: `Course with ID ${courseId} successfully deleted`,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error('Error deleting course', 'CourseService', error);
      throw error;
    }
  }

  async getCourses({
    page = 1,
    limit = 10,
    creatorId = undefined,
  }: {
    page?: number;
    limit?: number;
    creatorId?: string;
  }): Promise<CourseResponseListDTO> {
    try {
      const skip = (page - 1) * limit;

      const [courses, total] = await this.courseRepository.findAndCount({
        where: creatorId ? { user: { auth0Id: creatorId } } : {},
        relations: { user: true, cards: true },
        skip,
        take: limit,
      });
  
      const coursesResponseDTO = this.toCoursesResponseDTO(courses);
  
      this.logger.log('Courses fetched successfully', 'CourseService');
  
      return {
        meta: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          perPage: limit,
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
        data: coursesResponseDTO,
      };
    } catch (error) {
      this.logger.error('Error fetching courses', 'CourseService', error);
      throw error;
    }
  }
  // Entity methods
  async checkCourseExist(courseId: string, auht0Id: string): Promise<CourseEntity> {
    try {
      const courseEntity = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: { user: true },
      });
      
      if (!courseEntity) {
        this.logger.error(`Course not found with ID: ${courseId}`, 'CourseService');
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.NOT_FOUND, {
            name: 'course',
            id: courseId,
          }),
          EnumModules.COURSES,
          HttpStatus.NOT_FOUND,
        );
      }
      
      if (courseEntity.user.auth0Id !== auht0Id) {
        this.logger.warn(`Unauthorized access attempt to course ${courseId} by user ${auht0Id}`, 'CourseService');
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.FORBIDDEN, {
            name: 'course',
            id: courseId,
          }),
          EnumModules.COURSES,
          HttpStatus.FORBIDDEN,
        );
      }
      
      this.logger.log(`Course found successfully with ID: ${courseEntity.id}`, 'CourseService');
      
      return courseEntity; 
    } catch (error) {
      this.logger.error('Error getting course', 'CourseService', error);
      throw error;
    }
  } 

  async getCourseById(
    courseId: string,
    auht0Id: string,
  ): Promise<CourseEntity> {
    try {
      const foundCourse = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: { user: true, cards: true },
      });
  
      if (!foundCourse) {
        this.logger.error(`Course not found with ID: ${courseId}`, 'CourseService');
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.NOT_FOUND, {
            name: 'course',
            id: courseId,
          }),
          EnumModules.COURSES,
          HttpStatus.NOT_FOUND,
        );
      }
  
      if (foundCourse.user.auth0Id !== auht0Id) {
        this.logger.warn(`Unauthorized access attempt to course ${courseId} by user ${auht0Id}`, 'CourseService');
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.FORBIDDEN, {
            name: 'course',
            id: courseId,
          }),
          EnumModules.COURSES,
          HttpStatus.FORBIDDEN,
        );
      }
  
      this.logger.log(`Course found successfully with ID: ${foundCourse.id}`, 'CourseService');
  
      return foundCourse;
    } catch (error) {
      this.logger.error('Error getting course', 'CourseService', error);
      throw error;
    }
  }

  // Auto mapper methods
  private toCourseResponseDTO(courseEntity: CourseEntity): CourseResponseDTO {
    return this.mapper.map(courseEntity, CourseEntity, CourseResponseDTO);
  }

  private toExportCourseResponseDTO(courseEntity: CourseEntity): ExportCourseResponseDTO {
    return this.mapper.map(courseEntity, CourseEntity, ExportCourseResponseDTO);
  }

  private toImportCourseResponseDTO(courseEntity: CourseEntity): ImportCourseResponseDTO {
    return this.mapper.map(courseEntity, CourseEntity, ImportCourseResponseDTO);
  }

  private toCourseDetailsResponseDTO(
    courseEntity: CourseEntity,
  ): CourseDetailsResponseDTO {
    return this.mapper.map(
      courseEntity,
      CourseEntity,
      CourseDetailsResponseDTO,
    );
  }

  private toCoursesResponseDTO(
    courseEntities: CourseEntity[],
  ): CourseResponseDTO[] {
    return this.mapper.mapArray(
      courseEntities,
      CourseEntity,
      CourseResponseDTO,
    );
  }

  private toCourseEntity(
    createCourseRequestDTO: CreateCourseRequestDTO,
  ): CourseEntity {
    return this.mapper.map(
      createCourseRequestDTO,
      CreateCourseRequestDTO,
      CourseEntity,
    );
  }
}
