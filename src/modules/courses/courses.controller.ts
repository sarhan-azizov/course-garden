import {
  Controller,
  Body,
  Query,
  Post,
  Req,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiProduces,
  getSchemaPath,
  ApiExtraModels,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { formatValidationErrors } from './course.helpers';
import { PaginationRequestDTO, CustomBusinessException, getErrorMessage, EnumModules, ERROR_MESSAGE_KEYS } from '@/common';

import {
  CreateCourseRequestDTO,
  CourseResponseDTO,
  CourseResponseListDTO,
  UpdateCourseDTO,
  CourseDetailsResponseDTO,
  CourseIdParamDTO,
  ExportCourseResponseDTO,
  ImportCourseRequestDTO,
  ImportCourseResponseDTO,
} from './dto';
import { CoursesService } from './courses.service';

@ApiTags('Courses')
@Controller('/courses')
@ApiExtraModels(ExportCourseResponseDTO)
export class CoursesController {
  constructor(private readonly courseService: CoursesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a course' })
  @ApiResponse({
    status: 201,
    description: 'Returns the created course',
    type: CourseResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  createCourse(
    @Req() req: Request & { user: { sub: string } },
    @Body() createCourseRequestDTO: CreateCourseRequestDTO,
  ): Promise<CourseResponseDTO> {
    return this.courseService.createCourse(
      createCourseRequestDTO,
      req.user.sub,
    );
  }

  @Get('/:courseId/export')
  @ApiOperation({ summary: 'Export a course' })
  @ApiResponse({
    status: 200,
    description: 'JSON file with the course',
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(ExportCourseResponseDTO)
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiProduces('application/json') 
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async exportCourse(
    @Req() req: Request & { user: { sub: string } },
    @Param() params: CourseIdParamDTO,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const courseExportResponseDTO = await this.courseService.exportCourse(params.courseId, req.user.sub);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=course-${params.courseId}.json`);
      
      res.json(courseExportResponseDTO);
    } catch (error) {
      throw error;
    }
  }

  @Post('/import')
  @ApiOperation({ summary: 'Import a course from a JSON file' })
  @ApiResponse({ status: 200, description: 'Course imported successfully', type: ImportCourseResponseDTO })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 422, description: 'Invalid file format or content' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JSON file with course data'
        }
      }
    }
  })
  async importCourse(
    @Req() req: Request & { user: { sub: string } },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/json' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }) // 1MB max
        ],
      }),
    ) file: Express.Multer.File,
  ): Promise<ImportCourseResponseDTO> {
      let courseData;

      try {
        courseData = JSON.parse(file.buffer.toString());
      } catch (e) {
        throw new CustomBusinessException(
          getErrorMessage(ERROR_MESSAGE_KEYS.INVALID_DATA_FORMAT),
          EnumModules.COURSES,
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }

      const importCourseRequestDTO = plainToClass(ImportCourseRequestDTO, courseData);

      try {
        await validateOrReject(importCourseRequestDTO, {
          whitelist: true,
          forbidNonWhitelisted: true,
          validationError: { target: false },
        });
      } catch (validationErrors) {
        const formattedErrors = formatValidationErrors(validationErrors);

        if (Array.isArray(validationErrors)) {
          throw new CustomBusinessException(
            getErrorMessage(ERROR_MESSAGE_KEYS.INVALID_DATA_FORMAT),
            EnumModules.COURSES,
            HttpStatus.UNPROCESSABLE_ENTITY,
            formattedErrors
          );
        }

        throw validationErrors;
      }
      
      return await this.courseService.importCourse(importCourseRequestDTO, req.user.sub);
  }


  @Get('my')
  @ApiOperation({ summary: 'Get a paginated list of my courses' })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    type: CourseResponseListDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page',
  })
  getMyCourses(
    @Req() req: Request & { user: { sub: string } },
    @Query() paginationDTO: PaginationRequestDTO,
  ): Promise<CourseResponseListDTO> {
    return this.courseService.getCourses({
      page: paginationDTO.page,
      limit: paginationDTO.limit,
      creatorId: req.user.sub,
    });
  }

  @Get(':courseId')
  @ApiOperation({ summary: 'Get a course' })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    type: CourseDetailsResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden course deletion for the user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'courseId',
    type: 'string',
    description: 'The ID of the course to retrieve',
  })
  getCourse(
    @Req() req: Request & { user: { sub: string } },
    @Param() params: CourseIdParamDTO,
  ): Promise<CourseDetailsResponseDTO> {
    return this.courseService.getCourse(params.courseId, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of courses' })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    type: CourseResponseListDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page',
  })
  getCourses(
    @Query() paginationDTO: PaginationRequestDTO,
  ): Promise<CourseResponseListDTO> {
    return this.courseService.getCourses({
      page: paginationDTO.page,
      limit: paginationDTO.limit,
    });
  }

  @Patch(':courseId')
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({
    status: 200,
    description: 'Successful updated course response',
    type: CourseResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden course deletion for a user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'courseId',
    type: 'string',
    description: 'The ID of the course to update',
  })
  updateCourse(
    @Req() req: Request & { user: { sub: string } },
    @Body() updateCourseRequestDTO: UpdateCourseDTO,
    @Param() params: CourseIdParamDTO,
  ): Promise<CourseResponseDTO> {
    return this.courseService.updateCourse(
      params.courseId,
      updateCourseRequestDTO,
      req.user.sub,
    );
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Delete course by ID' })
  @ApiResponse({
    status: 200,
    description: 'The course successful deleted',
    type: CourseResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden course deletion for the user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'courseId',
    type: 'string',
    description: 'The ID of the course to delete',
  })
  deleteCourse(
    @Req() req: Request & { user: { sub: string } },
    @Param() params: CourseIdParamDTO,
  ): Promise<{ message: string; statusCode: 200 }> {
    return this.courseService.deleteCourse(params.courseId, req.user.sub);
  }
}
