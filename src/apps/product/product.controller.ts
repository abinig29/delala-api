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
import { EventService } from '@/libraries/event';
import { ProductApplicationEvent } from './product.event';
import { ExtendedProduct } from './dto/product.type';
import { generateSlug } from '@/common/util/slug';
import { BulkDeleteProductDto, CreateProductDto, FilterProductWithPagination, ProductDto, UpdateProductAdminStatusDto, UpdateProductDto } from './dto/product.input.dto';
import { ProductOwnerGuard } from './guard/product.guard';



@Controller(Endpoint.Product)
@ApiTags(Endpoint.Product)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private event: EventService
  ) { }


  @Post()
  @Roles(RoleType.USER)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  async createProduct(@Body() createDto: CreateProductDto, @CurUser() user: UserFromToken): Promise<Product> {
    const slug = generateSlug(createDto.name);
    const resp = await this.productService.createProduct({ ...createDto, slug }, user?.id);

    if (!resp.ok) throw new HttpException(resp.errMessage, resp.code);
    return resp.val;
  }



  @Patch(":id")
  @Roles(RoleType.USER)
  @UseGuards(JwtGuard, ProductOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  async updateProduct(@Body() createDto: UpdateProductDto, @Param('id') id: string): Promise<ExtendedProduct> {
    const resp = await this.productService.updateProduct({ ...createDto }, id);
    if (!resp.ok) throw new HttpException(resp.errMessage, resp.code);
    return resp.val;
  }



  @Get()
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all products for admin' })
  async findMany(@Query() inputQuery: FilterProductWithPagination): Promise<PaginatedResponse<Product>> {
    const paginateQuery = pickKeys(inputQuery, [...pagiKeys, 'searchText']);
    const query = removeKeys(inputQuery, [...pagiKeys, 'searchText']);
    const res = await this.productService.paginateProducts(
      query,
      paginateQuery,
    );
    return res
  }



  @Get(':id')
  // @Roles(RoleType.ADMIN, RoleType.USER)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully retrieved.',
    type: ProductDto
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  // @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string): Promise<ExtendedProduct> {
    const res = await this.productService.findPopulatedByIdOrFail(id);
    return res;
  }

  @Delete('bulk-delete')
  @Roles(RoleType.USER)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk delete products by IDs' })
  @ApiBody({
    type: BulkDeleteProductDto
  })
  @ApiResponse({
    status: 204,
    description: 'The products have been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Some products not found.'
  })
  async bulkDelete(@Body() bulkDeleteInquiryDto: BulkDeleteProductDto) {
    const res = await this.productService.bulkDeleteProducts(bulkDeleteInquiryDto.ids);
    if (!res.ok) throw new HttpException(res.errMessage, res.code);
    return res?.val;
  }




  @Delete(':id')
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiResponse({
    status: 204,
    description: 'The product has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseGuards(JwtGuard, ProductOwnerGuard)
  async deleteProduct(@Param('id') id: string): Promise<any> {
    const res = await this.productService.deleteProduct(id);
    if (!res?.ok) throw new HttpException(res?.errMessage, res?.code)
    return res.val;
  }




  @Patch(':id/adminStatus')
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product admin status' }) // Summary for the operation
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
  async update(@Param('id') id: string, @Body() updateProductAdminStatusDto: UpdateProductAdminStatusDto, @CurUser() user: UserFromToken): Promise<Product> {
    const res = await this.productService.findByIdAndChangeAdminStatus(id, updateProductAdminStatusDto);
    if (!res.ok) throw new HttpException(res.errMessage, res.code);
    if (updateProductAdminStatusDto?.status === "APPROVED")
      await this.event.emit<ProductApplicationEvent.ProductApproved.Payload>(
        ProductApplicationEvent.ProductApproved.key,
        { productId: id, userId: user?.id },
      )
    else if (updateProductAdminStatusDto?.status === "REJECTED")
      await this.event.emit<ProductApplicationEvent.ProductRejected.Payload>(
        ProductApplicationEvent.ProductRejected.key,
        { productId: id, userId: user?.id },
      )
    return res.val;
  }

}
