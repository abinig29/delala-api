import { Injectable } from '@nestjs/common';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.input.dto';
import { InquiryException } from './inquiry.exception';
import { PrismaService } from '@/core/database/prisma.service';
import { PrismaGenericRepository } from '@/core/database/prisma.repository';
import { FAIL, Resp, Succeed } from '@/common/constant';
import { ExtendedInquiry } from './inquiry.type';
import { PaginatedResponse, PaginationInputs } from '@/common/dto/pagination.dto';
import { Inquiry } from '@prisma/client';


@Injectable()
export class InquiryService {
  private readonly inquiryRepository: PrismaGenericRepository<any>;
  constructor(
    private exception: InquiryException,
    private prismaService: PrismaService,
  ) {
    this.inquiryRepository = new PrismaGenericRepository(this.prismaService.inquiry);
  }

  async create(createInquiryDto: CreateInquiryDto): Promise<Resp<ExtendedInquiry>> {
    const { productId, ...rest } = createInquiryDto
    try {
      const inquiry = await this.prismaService.inquiry.create({
        data: {
          ...rest,
          product: {
            connect: {
              id: productId
            }
          }
        },
        include: {
          product: true
        }
      })
      return Succeed(inquiry)
    } catch (error) {
      FAIL(error.message, 500)
    }

  }


  async paginateInquiry(
    filter: any,
    pagination: PaginationInputs,
  ): Promise<PaginatedResponse<ExtendedInquiry>> {
    const fieldsToSearch = ['name', 'email'];
    const data = await this.inquiryRepository.filterAndSearchManyAndPaginate(
      filter,
      fieldsToSearch,
      pagination,
      { product: true }
    );
    return data

  }


  async findOneByIdOrFail(id: string): Promise<Inquiry> {
    const inquiry = await this.prismaService.inquiry.findUnique({
      where: { id, },
    })
    if (!inquiry) {
      this.exception.notFoundById(id)
    }
    return inquiry
  }


  async updateInquiryStatus(id: string, updateInquiryDto: UpdateInquiryStatusDto): Promise<Resp<ExtendedInquiry>> {
    try {
      const inquiry = await this.prismaService.inquiry.update({
        where: { id },
        data: {
          status: updateInquiryDto?.status
        },
        include: {
          product: true
        }
      })
      return Succeed(inquiry)
    } catch (error) {
      FAIL(error.message, 500)
    }
  }

  async removeInquiry(id: string) {
    try {
      await this.findOneByIdOrFail(id)
      await this.prismaService.inquiry.delete({
        where: { id }
      })
      return Succeed(true)
    } catch (error) {
      return FAIL(error?.message, 500)
    }
  }
}
