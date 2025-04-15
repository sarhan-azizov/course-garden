import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  Length,
  Matches,
  IsEnum,
  Max,
  Min,
} from 'class-validator';
import { AutoMap } from '@automapper/classes';

import { ECardsType } from './cards.types';

export class CreateCardRequestDTO {
  @ApiProperty({
    required: true,
    enum: ECardsType,
    example: ECardsType.VIDEO,
    description: 'The type of the card.',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsEnum(ECardsType, { message: 'Invalid card type' })
  type: ECardsType;

  @ApiProperty({
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 100,
    description:
      'The title must be between 3 and 100 characters long and must match the specified pattern.',
    pattern:
      "^[а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9][а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9'\\-\\s]{2,99}$",
    default: 'Card title',
  })
  @AutoMap()
  @Length(3, 100)
  @Matches(
    /^[а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9][а-яёґєіїa-zА-ЯЁҐЄІЇA-Z0-9'\-\s]{2,99}$/,
  )
  title: string;

  @ApiProperty({
    required: true,
    type: 'number',
    description: 'The position of the card.',
    default: 1,
  })
  @AutoMap()
  @IsNotEmpty()
  @Min(1)
  @Max(35)
  position: number;

  @ApiProperty({
    required: false,
    type: 'string',
    nullable: true,
    minLength: 3,
    maxLength: 100,
    default: null,
    description: 'The content must be between 3 and 250 characters long.',
  })
  @AutoMap()
  @IsOptional()
  @Length(3, 250)
  content: string;

  @ApiProperty({
    required: false,
    type: 'string',
    nullable: true,
    minLength: 3,
    maxLength: 100,
    default: null,
    description:
      'The contentDetails must be between 3 and 250 characters long.',
  })
  @AutoMap()
  @IsOptional()
  @Length(3, 250)
  contentDetails: string;

  @ApiProperty({
    required: false,
    type: 'string',
    nullable: true,
    default: null,
    description: 'The base64 image of the course.',
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  contentImage: string;

  @ApiProperty({ required: true, type: 'boolean' })
  @AutoMap()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
