import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, UseGuards, Query } from '@nestjs/common';
import { Endpoint, UserFromToken } from '@/common/constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClassifiedService } from './classified.service';
import { ExtendedCategory } from './classified.type';

@Controller(Endpoint.Classified)
@ApiTags(Endpoint.Classified)
export class ClassifiedController {
  constructor(private readonly classifiedService: ClassifiedService) { }


  @Get("")
  @ApiOperation({ summary: 'Fetch all classified categories' })
  async findMany(): Promise<ExtendedCategory[]> {
    const res = await this.classifiedService.fetchCategories();
    return res
  }

}
