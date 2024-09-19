import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, UseGuards, Query } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { Endpoint, UserFromToken } from '@/common/constant';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInquiryDto, FilterInquiryWithPagination, UpdateInquiryStatusDto } from './dto/inquiry.input.dto';
import { RoleType } from '@prisma/client';
import { Roles } from '@/core/guard/roles.decorators';
import { CurUser, JwtGuard } from '@/core/guard';
import { pagiKeys, PaginatedResponse } from '@/common/dto/pagination.dto';
import { ExtendedInquiry } from './inquiry.type';
import { pickKeys, removeKeys } from '@/common/util/object';

@Controller(Endpoint.Inquiry)
@ApiTags(Endpoint.Inquiry)
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new inquiry' })
  @ApiBody({ type: CreateInquiryDto })
  @ApiResponse({
    status: 201,
    description: 'Inquiry created successfully',
  })
  async create(@Body() createInquiryDto: CreateInquiryDto) {
    const res = await this.inquiryService.create(createInquiryDto);
    if (!res?.ok) throw new HttpException(res?.errMessage, res?.code)
    return res?.val
  }


  @Get("product/:id")
  @Roles(RoleType.USER)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch inquiry of single product' })
  async findInquiriesOfSingleProduct(@Query() inputQuery: FilterInquiryWithPagination, @Param('id') id: string, @CurUser() user: UserFromToken): Promise<PaginatedResponse<ExtendedInquiry>> {
    const paginateQuery = pickKeys(inputQuery, [...pagiKeys, 'searchText']);
    const query = removeKeys(inputQuery, [...pagiKeys, 'searchText']);
    query["product"] = {
      userId: user?.id,
      id: id
    }
    const res = await this.inquiryService.paginateInquiry(
      query,
      paginateQuery,
    );
    return res
  }

  @Get("")
  @Roles(RoleType.USER)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all inquiry' })
  async findMany(@Query() inputQuery: FilterInquiryWithPagination, @Param('id') id: string, @CurUser() user: UserFromToken): Promise<PaginatedResponse<ExtendedInquiry>> {
    const paginateQuery = pickKeys(inputQuery, [...pagiKeys, 'searchText']);
    const query = removeKeys(inputQuery, [...pagiKeys, 'searchText']);
    query["product"] = {
      userId: user?.id,
    }
    const res = await this.inquiryService.paginateInquiry(
      query,
      paginateQuery,
    );
    return res
  }




  @Patch(':id/status')
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product admin status' }) // Summary for the operation
  @ApiParam({ name: 'id', description: 'The ID of the inquiry to update', type: String })
  @ApiBody({ type: UpdateInquiryStatusDto, description: 'The new  status for the inquiry' })
  @ApiResponse({
    status: 200,
    description: 'inquiry status updated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      },
    },
  })
  async update(@Param('id') id: string, @Body() updateInquiryDto: UpdateInquiryStatusDto) {
    const res = await this.inquiryService.updateInquiryStatus(id, updateInquiryDto);
    if (!res.ok) throw new HttpException(res.errMessage, res.code);
    return res?.val
  }





  @Delete(':id')
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a inquiry by ID' })
  @ApiResponse({
    status: 204,
    description: 'The inquiry has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'inquiry not found.' })
  @UseGuards(JwtGuard)
  async remove(@Param('id') id: string) {
    const res = await this.inquiryService.removeInquiry(id);
    if (!res.ok) throw new HttpException(res.errMessage, res.code);
    return res?.val
  }
}
