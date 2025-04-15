import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CourseIdParamDTO {
  @ApiProperty({
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  courseId: string;
}
