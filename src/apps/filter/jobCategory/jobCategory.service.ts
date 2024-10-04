import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Service } from '@prisma/client';


@Injectable()
export class JobCategoryService {

  constructor(private prismaService: PrismaService) { }

  async fetchServices(): Promise<Service[]> {
    const servicesValues = await this.prismaService.jobCategory.findMany({})
    return servicesValues
  }

}
