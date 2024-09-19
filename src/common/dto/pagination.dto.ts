


import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export const pagiKeys = ['limit', 'sort', 'page', 'sortOrder'];



export class PaginationInputs {
  @ApiPropertyOptional({
    description: 'Text to search users by',
    type: String,
  })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiPropertyOptional({
    description: 'Number of users per page',
    type: Number,
    default: 25,
    example: 25,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 25;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    type: Number,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    type: String,
    default: 'id',
    example: 'id',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'id';

  @ApiPropertyOptional({
    description: 'Order to sort by',
    type: String,
    enum: ['asc', 'desc'],
    default: 'asc',
    example: 'asc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class PaginatedResponse<T> {
  currentPage: number;
  totalPages: number;
  count: number;
  values: T[];
}