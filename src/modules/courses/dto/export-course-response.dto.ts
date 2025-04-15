import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { CreateCourseRequestDTO } from './create-course-request.dto';
import { CreateCardRequestDTO } from '../cards/dto';


export class ExportCourseResponseDTO extends CreateCourseRequestDTO {
  @ApiProperty({
    type: [CreateCardRequestDTO],
    description: 'The cards of the course',
  })
  @AutoMap()
  @Type(() => CreateCardRequestDTO)
  cards: CreateCardRequestDTO[];
}