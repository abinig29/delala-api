import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductService, } from './product.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Endpoint, ExtendedUser, UserFromToken } from '@/common/constant';
import { Product, RoleType, User } from '@prisma/client';
import { Roles } from '@/core/guard/roles.decorators';
import { CurUser, JwtGuard } from '@/core/guard';
import { pagiKeys, PaginatedResponse, } from '@/common/dto/pagination.dto';
import { pickKeys, removeKeys } from '@/common/util/object';
import { FilterProductWithPagination, ProductDto, UpdateProductAdminStatusDto, UpdateProductStatusDto } from './dto/product.input.dto';
import { ProductOwnerGuard } from './guard/product.guard';



@Controller(Endpoint.Product)
@ApiTags(Endpoint.Product)
export class ProductByUserController {
  constructor(
    private readonly productService: ProductService,
  ) { }




  @Get("/user/my")
  @Roles(RoleType.USER)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all my products' })
  async findMany(@Query() inputQuery: FilterProductWithPagination, @CurUser() user: UserFromToken): Promise<PaginatedResponse<Product>> {
    const paginateQuery = pickKeys(inputQuery, [...pagiKeys, 'searchText']);
    const query = removeKeys(inputQuery, [...pagiKeys, 'searchText']);
    query["userId"] = user?.id
    const res = await this.productService.paginateProducts(
      query,
      paginateQuery,
    );
    return res
  }




  @Patch(':id/status')
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtGuard, ProductOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product status' })
  @ApiParam({ name: 'id', description: 'The ID of the product to update', type: String })
  @ApiBody({ type: UpdateProductAdminStatusDto, description: 'The new admin status for the product' })
  @ApiResponse({
    status: 200,
    description: 'updated product',
    type: ProductDto
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
  async update(@Param('id') id: string, @Body() updateProductStatusDto: UpdateProductStatusDto): Promise<Product> {
    const res = await this.productService.findByIdAndChangeStatus(id, updateProductStatusDto);
    if (!res.ok) throw new HttpException(res.errMessage, res.code);
    return res.val;
  }




  @Patch(':id/view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product view as users visit detail page' })
  @ApiParam({ name: 'id', description: 'The ID of the product to update', type: String })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'product view updated' } }
  })
  async updateProductView(@Param('id') id: string): Promise<Product> {
    const res = await this.productService.updateProductView(id);
    if (!res.ok) throw new HttpException(res.errMessage, res.code);
    return res.val;
  }

}
