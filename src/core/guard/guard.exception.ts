import { HttpStatus, Injectable } from '@nestjs/common';
import { ExceptionService } from '../exception';

@Injectable()
export class GuardException {
    constructor(private service: ExceptionService) { }
    unauthorized() {
        return this.service.throw({
            status: HttpStatus.UNAUTHORIZED,
            code: 1001,
            publicMessage: 'Unauthorized access',
            privateMessage: 'Access is denied due to invalid credentials or insufficient permissions.',
        });
    }

    forbidden() {
        return this.service.throw({
            status: HttpStatus.FORBIDDEN,
            code: 1002,
            publicMessage: 'Forbidden',
            privateMessage: 'You do not have permission to access this resource.',
        });
    }

    tokenExpired() {
        return this.service.throw({
            status: HttpStatus.UNAUTHORIZED,
            code: 1003,
            publicMessage: 'Token expired',
            privateMessage: 'The authentication token has expired. Please login again.',
        });
    }

    invalidToken() {
        return this.service.throw({
            status: HttpStatus.UNAUTHORIZED,
            code: 1004,
            publicMessage: 'Invalid token',
            privateMessage: 'The provided token is invalid. Please provide a valid token.',
        });
    }
}
