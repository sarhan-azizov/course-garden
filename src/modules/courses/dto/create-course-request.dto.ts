import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  Length,
  Matches,
  IsString,
} from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreateCourseRequestDTO {
  @ApiProperty({
    required: true,
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
  @Length(3, 100)
  @Matches(
    /^[а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9][а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9'\-\s]{2,99}$/,
  )
  title: string;

  @ApiProperty({
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 250,
    description:
      'The description must be between 3 and 250 characters long and must match the specified pattern.',
    default: 'Course description',
  })
  @AutoMap()
  @Length(3, 250)
  description: string;

  @ApiProperty({
    required: false,
    type: String,
    nullable: true,
    description:
      'The cover must be a Base64 encoded image string that represents the course cover image.',
    default: null,
  })
  @AutoMap()
  @IsString()
  @IsOptional()
  @Matches(/^data:image\/[a-z]+;base64,.+/, {
    message: 'Invalid base64 image format',
  })
  cover: string;

  @ApiProperty({ required: true, type: 'boolean' })
  @AutoMap()
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ required: false, type: 'boolean', default: false })
  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
