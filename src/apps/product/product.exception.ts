import { ExceptionService } from '@/core/exception'
import { HttpStatus, Injectable } from '@nestjs/common'



@Injectable()
export class ProductException {
  constructor(private service: ExceptionService) { }

  notFoundById(id: string) {
    return this.service.throw({
      status: HttpStatus.NOT_FOUND,
      code: 1,
      publicMessage: 'Product was not found',
      privateMessage: `Product with id "${id}" was not found.`,
    })
  }

  unauthorizedAccess(userId: string, productId: string) {
    return this.service.throw({
      status: HttpStatus.FORBIDDEN,
      code: 2,
      publicMessage: 'You do not have permission to access this product',
      privateMessage: `User with id "${userId}" tried to access product with id "${productId}" without permission.`,
    });
  }


}
