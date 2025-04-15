import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { CourseResponseDTO } from './course-response.dto';
import { CardResponseDTO } from '../cards/dto';


export class ImportCourseResponseDTO extends CourseResponseDTO {
  @ApiProperty({
    type: [CourseResponseDTO],
    description: 'The cards of the course',
  })
  @AutoMap()
  @Type(() => CardResponseDTO)
  cards: CardResponseDTO[];
}