import { ExceptionService } from '@/core/exception'
import { HttpStatus, Injectable } from '@nestjs/common'



@Injectable()
export class InquiryException {
  constructor(private service: ExceptionService) { }

  notFoundById(id: string) {
    return this.service.throw({
      status: HttpStatus.NOT_FOUND,
      code: 1,
      publicMessage: 'Inquiry was not found',
      privateMessage: `Inquiry with id "${id}" was not found.`,
    })
  }



}
