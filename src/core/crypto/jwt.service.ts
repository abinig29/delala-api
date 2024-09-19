import { Injectable } from '@nestjs/common';

import { verify, JwtPayload, sign } from 'jsonwebtoken';
import { UserFromToken } from "../../common/constant/role"

import { FAIL, Resp, Succeed } from '../../common/constant/return.const';

import { ConfigurationService } from '../configuration';
import { LoggerService, Logger } from 'src/libraries/logger';

@Injectable()
export class CustomJwtService {
  private logger: Logger


  constructor(private configurationService: ConfigurationService, private loggerService: LoggerService) {
    this.logger = this.loggerService.create({ name: 'CryptoService' })
  }


  public async signJwtToken(payload: any, secret: string, options) {
    return sign(payload, secret, options);
  }

  public async verifyJwtToken(token: string, secret: string) {
    return verify(token, secret, {
      algorithms: ['HS256'],
    }) as JwtPayload;
  }


  public async signAccessToken(payload: any) {
    const secret = this.configurationService.getAccessSignToken()

    try {
      const token = sign(payload,
        secret,
        {
          expiresIn: `${this.configurationService.getNumber('JWT_EXPIRY_TIME')}m`,
          algorithm: 'HS256',
        });
      return token;
    } catch (error) {

    }


  }

  public async verifyAccessToken(token: string) {

    try {
      const decoded = verify(token, this.configurationService.get('JWT_ACCESS_SECRET'), {
        algorithms: ['HS256'],
        complete: true,
      });
      return decoded.payload;
    } catch (e) {
      this.logger.error(e)
      throw e;
    }
  }

  public async signRefreshToken(payload: any) {
    const token = sign(payload, this.configurationService.get('JWT_REFRESH_SECRET'), {
      expiresIn: `${this.configurationService.get('JWT_REFRESH_EXPIRY_TIME')}d`,
      algorithm: 'HS256',
    });
    return token
  }

  public async verifyRefreshToken(token: string): Promise<Resp<UserFromToken>> {
    try {
      const decoded = verify(token, this.configurationService.get('JWT_REFRESH_SECRET'), {
        algorithms: ['HS256'],
      }) as JwtPayload;

      if (!decoded._id) return FAIL('NO User id found on the JWT');
      const userToken: UserFromToken = {
        expiryDate: decoded.exp,
        id: decoded._id,
        role: decoded.role,
        sessionId: decoded.sessionId,
      };
      return Succeed(userToken);
    } catch (e) {
      return FAIL(e.message);
    }
  }
}
