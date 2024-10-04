import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, UseGuards, Query } from '@nestjs/common';
import { Endpoint, UserFromToken } from '@/common/constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CarMake, RoleType, Service } from '@prisma/client';
import { Roles } from '@/core/guard/roles.decorators';
import { CurUser, JwtGuard } from '@/core/guard';
import { CarMakeService } from './carMake.service';

@Controller(Endpoint.CarMake)
@ApiTags(Endpoint.CarMake)
export class CarMakeController {
  constructor(private readonly carMakeService: CarMakeService) { }

  @Get("")
  // @Roles(RoleType.USER, RoleType.ADMIN)
  // @UseGuards(JwtGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all car makes' })
  async findMany(): Promise<CarMake[]> {
    const res = await this.carMakeService.fetchCarMakes();
    return res
  }

}
