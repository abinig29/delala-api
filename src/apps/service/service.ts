import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, UseGuards, Query } from '@nestjs/common';
import { Endpoint, UserFromToken } from '@/common/constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType, Service } from '@prisma/client';
import { Roles } from '@/core/guard/roles.decorators';
import { CurUser, JwtGuard } from '@/core/guard';
import { ServiceService } from './service.service';

@Controller(Endpoint.Service)
@ApiTags(Endpoint.Service)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) { }


  @Get("")
  @Roles(RoleType.USER, RoleType.ADMIN)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all inquiry' })
  async findMany(): Promise<Service[]> {
    const res = await this.serviceService.fetchServices();
    return res
  }

}
