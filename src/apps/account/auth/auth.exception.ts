import { HttpStatus, Injectable } from '@nestjs/common'
import { ExceptionService } from '../../../core/exception'

@Injectable()
export class AuthenticationApplicationException {
  constructor(private service: ExceptionService) { }

  invalidAccessToken() {
    return this.service.throw({
      status: HttpStatus.UNAUTHORIZED,
      code: 1,
      publicMessage: 'Access token is invalid',
    })
  }


  userEmailNotFound(email: string) {
    return this.service.throw({
      status: HttpStatus.UNAUTHORIZED,
      code: 2,
      publicMessage: 'Incorrect email or password',
      privateMessage: `User with email "${email}" was not found`,
    })
  }

  userPasswordNotFound(email: string) {
    return this.service.throw({
      status: HttpStatus.UNAUTHORIZED,
      code: 3,
      publicMessage: 'Incorrect email or password',
      privateMessage: `Password does not match user with email "${email}"`,
    })
  }

  userAlreadyVerified() {
    return this.service.throw({
      status: HttpStatus.UNAUTHORIZED,
      code: 4,
      publicMessage: 'User already verified',
      // privateMessage: `Password does not match user with email "${email}"`,
    })
  }


  userEmailNotAvailable(email: string) {
    return this.service.throw({
      status: HttpStatus.CONFLICT,
      code: 5,
      publicMessage: 'Email is not available',
      privateMessage: `User can not register with email "${email}" as it is already taken.`,
    })
  }

  invalidResetPasswordToken() {
    return this.service.throw({
      status: HttpStatus.FORBIDDEN,
      code: 6,
      publicMessage: 'Reset password token is invalid',
    })
  }

  invalidGoogleToken(error?: Error) {
    return this.service.throw({
      status: HttpStatus.FORBIDDEN,
      code: 7,
      publicMessage: 'Access token is invalid',
      cause: error,
    })
  }
  invalidCodeVerification() {
    return this.service.throw({
      status: HttpStatus.BAD_REQUEST,
      code: 8,
      publicMessage: 'Code is incorrect',
    })
  }
  invalidAuthProvider() {
    return this.service.throw({
      status: HttpStatus.CONFLICT,
      code: 10,
      publicMessage: 'Please continue with google to sign in',
    })
  }

  expiredCodeVerification() {
    return this.service.throw({
      status: HttpStatus.BAD_REQUEST,
      code: 9,
      publicMessage: 'Code is expired',
    })
  }

  invalidRefreshToken() {
    return this.service.throw({
      status: HttpStatus.UNAUTHORIZED,
      code: 10,
      publicMessage: 'Refresh token is invalid',
    })
  }
}
