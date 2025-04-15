import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDTO } from '@/common';

import { CreateCourseRequestDTO } from './create-course-request.dto';

export class CourseResponseDTO extends CreateCourseRequestDTO {
  @ApiProperty({
    required: true,
    type: 'string',
    example: '50d46b4d-aa5b-4fbd-88ed-9fa1c44e6a54',
    format: 'uuid',
    description: 'The ID of the course',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    required: true,
    type: 'string',
    example: '50d46b4d-aa5b-4fbd-88ed-9fa1c44e6a54',
    format: 'uuid',
    description: 'The ID of the user who created the course',
  })
  @AutoMap()
  creatorId: string;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @AutoMap()
  activeCardsCount: number;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @AutoMap()
  draftCardsCount: number;

  @ApiProperty({
    required: true,
    type: Number,
    default: Date.now(),
  })
  @AutoMap()
  createdAt: Date;

  @ApiProperty({
    required: true,
    type: Number,
    default: Date.now(),
  })
  @AutoMap()
  updatedAt: Date;

  @ApiProperty({
    required: true,
    type: Number,
    default: null,
  })
  deletedAt: Date;
}

export class CourseResponseListDTO {
  @ApiProperty({
    required: true,
    type: () => PaginationMetaDTO,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaDTO;

  @ApiProperty({
    required: true,
    type: () => CourseResponseDTO,
    isArray: true,
    description: 'Data for the current page',
  })
  data: CourseResponseDTO[];
}
