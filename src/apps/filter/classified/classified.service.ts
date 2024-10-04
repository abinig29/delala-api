import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Service } from '@prisma/client';
import { ExtendedCategory } from './classified.type';


@Injectable()
export class ClassifiedService {

  constructor(private prismaService: PrismaService) { }
  async fetchCategories(): Promise<ExtendedCategory[]> {
    const categories = await this.prismaService.mainCategory.findMany({
      include: {
        subCategories: {
          include: {
            lastCategories: true
          }
        }
      }
    })
    return categories
  }

}
