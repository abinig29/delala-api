import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Service } from '@prisma/client';


@Injectable()
export class CarMakeService {

  constructor(private prismaService: PrismaService) { }

  async fetchCarMakes(): Promise<Service[]> {
    const carMakeValues = await this.prismaService.carMake.findMany({})
    return carMakeValues
  }

}
