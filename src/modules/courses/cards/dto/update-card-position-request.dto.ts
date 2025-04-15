import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCardPositionRequestDTO {
  @ApiProperty({
    example: 2,
    minimum: 1,
    description: 'New position of the card (1-based)',
    required: true,
  })
  @IsInt()
  @Min(1)
  newPosition: number;
}
