import { AutoMap } from '@automapper/classes';
import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { CreateCourseRequestDTO } from './create-course-request.dto';
import { CreateCardRequestDTO } from '../cards/dto';


export class ImportCourseRequestDTO extends CreateCourseRequestDTO {
  @ApiProperty({
    type: [CreateCardRequestDTO],
    description: 'The cards of the course',
  })
  @AutoMap()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCardRequestDTO)
  cards: CreateCardRequestDTO[];
}