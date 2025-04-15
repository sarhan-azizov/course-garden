import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class UpdateCardPositionResponseDTO {
  @ApiProperty({
    required: true,
    type: 'string',
    example: '50d46b4d-aa5b-4fbd-88ed-9fa1c44e6a54',
    format: 'uuid',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    example: 2,
    minimum: 1,
    description: 'New position of the card',
  })
  @AutoMap()
  position: number;
}
