import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomJwtService } from '@/core/crypto';
import { UserFromToken } from '@/common/constant';
import { ProductService } from '../product.service';
import { ProductException } from '../product.exception';

@Injectable()
export class ProductOwnerGuard implements CanActivate {
    constructor(
        private readonly productService: ProductService,
        private readonly reflector: Reflector,
        private readonly jwtService: CustomJwtService,
        private readonly productException: ProductException
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request["user"] as UserFromToken
        const { id } = request.params;
        const token = request.headers.authorization.split(' ')[1]; // Get JWT token from Authorization header
        const product = await this.productService.findOneByIdOrFail(id);

        console.log({ product, user })

        if (product.userId !== user.id) {
            this.productException.unauthorizedAccess(user.id, product?.id)
        }

        return true;
    }
}
