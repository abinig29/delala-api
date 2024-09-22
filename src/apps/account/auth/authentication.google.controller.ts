import { Body, Controller, Post, Res } from '@nestjs/common'
import { EventService } from '../../../libraries/event'

import { Logger, LoggerService } from '../../../libraries/logger'
import { Response } from 'express'
import { CookieService } from '../../../core/cookie'
import { GoogleByAuthenticationCallbackDto } from './dto/auth.input.dto'
import { Endpoint } from '@/common/constant'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { GoogleService } from '@/libraries/google'
import { AuthToken, AuthTokenResponse } from './dto/auth.response.dto'
import { AuthenticationApplicationEvent } from './auth.event'
import { CryptoService } from '@/core/crypto'
import { User } from '@prisma/client'
import { AuthenticationApplicationException } from './auth.exception'
import { ApiTags } from '@nestjs/swagger'


@Controller(`${Endpoint.Auth}/google`)
@ApiTags("Google")
export class GoogleByAuthenticationController {
  private logger: Logger

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private googleService: GoogleService,
    private loggerService: LoggerService,
    private eventService: EventService,
    private exception: AuthenticationApplicationException,
    private cookieService: CookieService,
    private cryptoService: CryptoService,
  ) {
    this.logger = this.loggerService.create({
      name: 'GoogleByAuthenticationController',
    })
  }

  @Post('/callback')
  async callback(
    @Body() body: GoogleByAuthenticationCallbackDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthTokenResponse> {
    console.log({ body })
    const { name, email } = await this.googleService
      .verifyToken(body.token)
      .catch(error => this.exception.invalidGoogleToken(error))
    let token: AuthToken
    let user: User

    try {
      user = await this.userService.findOneByEmailOrFail(email)
      token = await this.authService.generateAuthToken(
        {
          id: user.id,
          role: user?.role,
        }
      )
    } catch (error) {
      const res = await this.register(email, name)
      token = res.token
      user = res.user
    }
    const hashedRefreshToken = await this.cryptoService.createHash(token.refreshToken);
    await this.userService.upsertOne(
      { id: user?.id },
      {
        hashedRefreshToken,
      },
    );
    this.cookieService.setAccessToken(response, token?.refreshToken)
    return { authToken: token, userData: user }
  }

  private async register(
    email: string,
    name: string,
  ): Promise<{ token: AuthToken, user: User }> {
    const createdUser = await this.userService.registerUser({
      email,
      fullName: name,
      accountStatus: "EMAIL_VERIFIED",
    })
    const token = await this.authService.generateAuthToken({
      id: createdUser.id,
      role: createdUser?.role,
    })

    await this.eventService.emit<AuthenticationApplicationEvent.Verified.Payload>(
      AuthenticationApplicationEvent.Verified.key,
      { userId: createdUser.id },
    )

    this.logger.log(`User ${email} registered with google`)
    return { token, user: createdUser }
  }
}
