import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IncomingMessage } from 'http';
//crypto
import { CustomJwtService, UserFromToken } from './guards.dependencies';

import { ROLES_KEY } from './roles.decorators';
import { GuardException } from './guard.exception';
import { RoleType } from '@prisma/client';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: CustomJwtService,
    private guardException: GuardException) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest<IncomingMessage & { user?: Record<string, unknown> }>(context);
    const token = this.getToken(request);
    console.log({ token })
    const user: UserFromToken = (await this.jwtService.verifyAccessToken(token as string)) as UserFromToken;
    if (!user) this.guardException.tokenExpired()
    request.user = user as any;

    const classRole = this.reflector.get<RoleType[]>(ROLES_KEY, context.getClass());
    const handlerRole = this.reflector.get<RoleType[]>(ROLES_KEY, context.getHandler());

    let allowedRoles: RoleType[] = [];

    if (classRole) {
      allowedRoles = classRole;
    }
    if (handlerRole) {
      allowedRoles = allowedRoles.concat(handlerRole);
    }

    if (allowedRoles.length < 1) return true;
    allowedRoles.push(RoleType.SUPER_ADMIN);
    return user.role && allowedRoles.includes(user.role);

  }

  protected getRequest<T>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }

  protected getToken(request: { headers: Record<string, string | string[]> }) {
    const authorization = request.headers['authorization'] as string
    if (!authorization) {
      this.guardException.invalidToken();
    }
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      this.guardException.invalidToken(); // Handle invalid token case
    }

    return token;
  }
}
