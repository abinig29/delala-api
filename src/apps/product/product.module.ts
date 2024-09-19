import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductException } from './product.exception';
import { ProductController } from './product.controller';
import { ProductOwnerGuard } from './guard/product.guard';
import { ProductByUserController } from './product.byUser.controller';

@Module({
    providers: [ProductService, ProductException, ProductOwnerGuard],
    controllers: [ProductController, ProductByUserController],
    exports: [ProductService]
})
export class ProductModule { }
