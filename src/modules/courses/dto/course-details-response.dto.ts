import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

import { CardResponseDTO } from '../cards/dto/card-response.dto';
import { CourseResponseDTO } from './course-response.dto';

export class CourseDetailsResponseDTO extends CourseResponseDTO {
  @ApiProperty({
    required: true,
    type: () => [CardResponseDTO],
  })
  @AutoMap()
  cards: CardResponseDTO[];
}
