import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Service } from '@prisma/client';


@Injectable()
export class ServiceService {

  constructor(private prismaService: PrismaService) { }

  async fetchServices(): Promise<Service[]> {
    const servicesValues = await this.prismaService.service.findMany({})
    return servicesValues
  }

}
