import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationRequestDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class PaginationMetaDTO {
  @ApiProperty({ example: 100, description: 'Total number of items' })
  totalItems: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  currentPage: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  perPage: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if there is a next page',
  })
  hasNextPage: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates if there is a previous page',
  })
  hasPreviousPage: boolean;
}
