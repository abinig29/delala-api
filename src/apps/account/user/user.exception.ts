import { HttpStatus, Injectable } from '@nestjs/common'
import { ExceptionService } from '../../../core/exception'

@Injectable()
export class UserException {
  constructor(private service: ExceptionService) { }

  notFoundById(id: string) {
    return this.service.throw({
      status: HttpStatus.NOT_FOUND,
      code: 1,
      publicMessage: 'User was not found',
      privateMessage: `User with id "${id}" was not found.`,
    })
  }

  passwordsAreSame() {
    return this.service.throw({
      status: HttpStatus.BAD_REQUEST,
      code: 5,
      publicMessage: 'New password cannot be the same as the old password',
      privateMessage: 'The old password and new password are the same. Please choose a different new password.',
    });
  }
  oldPasswordDoesNotMatch() {
    return this.service.throw({
      status: HttpStatus.BAD_REQUEST,
      code: 6,
      publicMessage: 'Old password is incorrect',
      privateMessage: 'The provided old password does not match the current password. Please check and try again.',
    });
  }
  notFoundByEmail(email: string) {
    return this.service.throw({
      status: HttpStatus.NOT_FOUND,
      code: 2,
      publicMessage: 'User was not found',
      privateMessage: `User with email "${email}" was not found.`,
    })
  }
}
