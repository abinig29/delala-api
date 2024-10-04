import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, UseGuards, Query } from '@nestjs/common';
import { Endpoint, UserFromToken } from '@/common/constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobCategory, RoleType, Service } from '@prisma/client';
import { Roles } from '@/core/guard/roles.decorators';
import { CurUser, JwtGuard } from '@/core/guard';
import { JobCategoryService } from './jobCategory.service';

@Controller(Endpoint.JobCategory)
@ApiTags(Endpoint.JobCategory)
export class JobCategoryController {
  constructor(private readonly jobCategoryService: JobCategoryService) { }

  @Get("")
  // @Roles(RoleType.USER, RoleType.ADMIN)
  // @UseGuards(JwtGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all job categories' })
  async findMany(): Promise<JobCategory[]> {
    const res = await this.jobCategoryService.fetchServices();
    return res
  }

}
