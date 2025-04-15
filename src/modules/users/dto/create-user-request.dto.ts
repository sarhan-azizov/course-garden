import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreateUserRequestDTO {
  @ApiProperty({ required: true, type: 'string' })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  auth0Id: string;

  @ApiProperty({ required: true, type: 'string' })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ required: true, type: 'string' })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    required: true,
    type: 'string',
    example: 'email@email.com',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: 'string',
    default: null,
  })
  @AutoMap()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: true, type: 'string' })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ type: 'string', default: null })
  @AutoMap()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ type: 'string', default: null })
  @AutoMap()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: true, type: 'string' })
  @AutoMap()
  @MaxLength(120)
  @IsNotEmpty()
  @IsString()
  role: string;
}
