import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, Length, Matches } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class UpdateCourseDTO {
  @ApiProperty({
    required: false,
    type: 'string',
    minLength: 3,
    maxLength: 100,
    description:
      'The title must be between 3 and 100 characters long and must match the specified pattern.',
    pattern:
      "^[а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9][а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9'\\-\\s]{2,99}$",
    default: 'Course title',
  })
  @AutoMap()
  @IsOptional()
  @Length(3, 50)
  @Matches(
    /^[а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9][а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9'\-\s]{2,99}$/,
  )
  title?: string;

  @ApiProperty({
    required: false,
    type: 'string',
    minLength: 3,
    maxLength: 250,
    description:
      'The description must be between 3 and 250 characters long and must match the specified pattern.',
    default: 'Course description',
  })
  @AutoMap()
  @IsOptional()
  @Length(3, 250)
  description?: string;

  @ApiProperty({ required: false, type: 'boolean' })
  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ required: false, type: 'boolean', default: false })
  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
