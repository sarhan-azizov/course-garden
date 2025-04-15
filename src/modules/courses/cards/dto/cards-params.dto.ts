import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CardIdParamDTO {
  @ApiProperty({
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  cardId: string;
}

export class CourseIdParamDTO {
  @ApiProperty({
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  courseId: string;
}

export class CardParamsDTO {
  @ApiProperty({
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  courseId: string;
  
  @ApiProperty({
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  cardId: string;
}
