import { Request, Response } from 'express';
import { IsOptional } from 'class-validator';



export const pagiKeys = ['limit', 'sort', 'page', 'sortOrder'];

enum SortOrder {
  asc = 1,
  desc = -1,
}

export class PaginationInputs {
  @IsOptional()
  searchText?: string;

  @IsOptional()
  limit?: number = 25;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  sort?: string = '_id';

  @IsOptional()
  sortOrder?: SortOrder = 1;
}

export class PaginatedRes<T> {
  count: number;

  data: T[];
}
