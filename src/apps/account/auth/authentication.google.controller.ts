import { Body, ConflictException, Controller, Get, HttpException, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { EventService } from '../../../libraries/event'

import { Logger, LoggerService } from '../../../libraries/logger'
import { Response } from 'express'
import { CookieService } from '../../../core/cookie'
import { GoogleByAuthenticationDto } from './dto/auth.input.dto'
import { Endpoint } from '@/common/constant'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { GoogleService } from '@/libraries/google'
import { AuthToken, AuthTokenResponse } from './dto/auth.response.dto'
import { AuthenticationApplicationEvent } from './auth.event'
import { CryptoService } from '@/core/crypto'
import { AUTH_PROVIDER, User } from '@prisma/client'
import { AuthenticationApplicationException } from './auth.exception'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { removeKeys } from '@/common/util/object'
import { error } from 'node:console'


@Controller(`${Endpoint.Auth}/google`)
@ApiTags("Google")
export class GoogleByAuthenticationController {
  private logger: Logger

  constructor(
    private userService: UserService,
    private authService: AuthService,
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



  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
  }


  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const usr = req.user
    try {
      await this.userService.findOneByEmailOrFail(usr?.email)
    } catch (error) {
      await this.register(usr?.email, usr?.firstName + " " + usr?.lastName)
    }
    return res.redirect(`http://localhost:3000/authenticating?token=${usr?.accessToken}&email=${usr?.email}`);
  }

  private async register(
    email: string,
    name: string,
  ): Promise<{ user: User }> {
    const createdUser = await this.userService.registerUser({
      email,
      fullName: name,
      accountStatus: "EMAIL_VERIFIED",
      authProvider: AUTH_PROVIDER.GOOGLE
    })
    this.logger.log(`User ${email} registered with google`)
    return { user: createdUser }
  }


  @Get('checkToken')
  async checkAndReturnProfile(@Query() query: GoogleByAuthenticationDto,
    @Res({ passthrough: true }) res: Response) {
    const { email, token } = query
    const { returnEmail } = await this.googleService.getUserInfo(token)
    if (returnEmail != email) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    const user = await this.userService.findOneByEmailOrFail(email)
    if (user?.authProvider != AUTH_PROVIDER.GOOGLE) {
      throw new HttpException('Please log in with your email and password.', 409);
    }
    const loginAuthToken: AuthToken = await this.authService.generateAuthToken({
      id: user?.id,
      role: user?.role,
    });

    const hashedRefreshToken = await this.cryptoService.createHash(loginAuthToken.refreshToken);
    await this.userService.upsertOne(
      { id: user?.id },
      {
        hashedRefreshToken,
      },
    );
    this.cookieService.setAccessToken(res, loginAuthToken?.refreshToken)
    const pickedUser = removeKeys(user, [
      'password',
      'hashedRefreshToken',
      'verificationCodeHash',
      'verificationCodeExpires',
      "accountStatus"
    ]) as User;
    console.log({ loginAuthToken })
    return { authToken: loginAuthToken, userData: pickedUser }
  }
}