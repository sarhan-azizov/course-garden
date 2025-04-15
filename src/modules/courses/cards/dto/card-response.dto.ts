import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

import { CreateCardRequestDTO } from './create-card-request.dto';

export class CardResponseDTO extends CreateCardRequestDTO {
  @ApiProperty({
    required: true,
    type: 'string',
    example: '50d46b4d-aa5b-4fbd-88ed-9fa1c44e6a54',
    format: 'uuid',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    required: true,
    type: String,
    example: '50d46b4d-aa5b-4fbd-88ed-9fa1c44e6a54',
    description: 'The ID of the course',
  })
  @AutoMap()
  courseId: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'The ID of the user who created the card',
  })
  @AutoMap()
  creatorId: string;

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
