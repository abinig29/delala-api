import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CryptoService, CustomJwtService } from 'src/core/crypto';
import { Logger, LoggerService } from 'src/libraries/logger';
import { LoginUserInput, RegisterUserInput, ResetPasswordInput } from './dto/auth.input.dto';
import { FAIL, Resp, Succeed, SystemConst, UserFromToken } from 'src/common/constant';
import { AuthenticationApplicationException } from './auth.exception';
import { EventService } from 'src/libraries/event';
import { AuthenticationApplicationEvent } from './auth.event';
import { RespConst, ResponseConst } from 'src/common/constant/response.const';
import { AUTH_PROVIDER, RoleType, User } from '@prisma/client';
import { UserRes } from 'src/common/dto/resp.user.dto';
import { AuthToken, AuthTokenResponse } from './dto/auth.response.dto';
import { removeKeys } from '@/common/util/object';

import { CookieService } from '@/core/cookie';
import { Request, Response } from 'express';
import { ConfigurationService } from '@/core/configuration';


export class UserAndToken {
    usrToken: UserFromToken;
    user: User;
}




@Injectable()
export class AuthService {
    private logger: Logger
    constructor(
        private usersService: UserService,
        private jwtService: CustomJwtService,
        private cryptoService: CryptoService,
        private loggerService: LoggerService,
        private event: EventService,
        private exception: AuthenticationApplicationException,
        private configService: ConfigurationService,
        private cookieService: CookieService
    ) {
        this.logger = this.loggerService.create({
            name: 'AuthenticationService',
        })
    }

    public async registerWithEmailCode(input: RegisterUserInput): Promise<Resp<string>> {
        try {
            const userExisting = await this.usersService.findOneByEmail(input.email);
            if (userExisting) {
                this.exception.userEmailNotAvailable(input.email)
            }
            const hashedPassword = await this.cryptoService.createHash(input.password);
            const user = await this.usersService.registerUser({
                ...input,
                authProvider: AUTH_PROVIDER.CREDENTIAL,
                password: hashedPassword,
            })
            const res = await this.sendCodeAndUpdateHash(user?.id);
            await this.event.emit<AuthenticationApplicationEvent.UserRegistered.Payload>(
                AuthenticationApplicationEvent.UserRegistered.key,
                { userId: user?.id, code: res?.val },
            )
            return Succeed(RespConst.VERIFICATION_SENT);

        } catch (e) {
            return FAIL(e.message);
        }
    }

    getTokenFromCookie(request: Request) {
        const token = this.cookieService.getAccessToken(request)
        if (!token || token == 'undefined') this.exception.invalidRefreshToken()
        return token
    }


    async resetTokens(resetToken: string, response: Response): Promise<Resp<AuthTokenResponse>> {
        const user = await this.getUserFromRefreshToken(resetToken);
        const refreshAuthToken = await this.generateAuthToken(user.val.usrToken, true);
        const hashedRefreshToken = await this.cryptoService.createHash(refreshAuthToken.refreshToken);
        await this.usersService.upsertOne(
            { id: user.val.user.id },
            { hashedRefreshToken: hashedRefreshToken }
        );
        this.cookieService.setAccessToken(response, refreshAuthToken?.refreshToken)
        return Succeed({ authToken: refreshAuthToken, userData: user.val.user });
    }


    async sendCodeAndUpdateHash(userId: string): Promise<Resp<string>> {
        const code = "00000";
        const codeHash = await this.cryptoService.createHash(code);

        await this.usersService.upsertOne(
            { id: userId },
            {
                verificationCodeHash: codeHash,
                verificationCodeExpires: Date.now() + SystemConst.VERIFICATION_CODE_EXP,
            },
        );
        this.logger.log(`code to be sent: CODE:${code} CODE_HASH:${codeHash} `)
        return Succeed(code)
    }

    public async activateAccountByCode(phoneOrEmail: string, code: string): Promise<Resp<UserRes>> {

        const verifyToActivate = await this.verifyCode(phoneOrEmail, code);
        if (verifyToActivate.accountStatus === "EMAIL_VERIFIED") this.exception.userAlreadyVerified()
        const updatedUser = await this.usersService.upsertOne(
            { email: phoneOrEmail },
            {
                accountStatus: "EMAIL_VERIFIED",
                verificationCodeExpires: 0,
                verificationCodeHash: ""
            },
        );
        await this.event.emit<AuthenticationApplicationEvent.Verified.Payload>(
            AuthenticationApplicationEvent.Verified.key,
            { userId: updatedUser?.val?.id },
        )
        const pickedUser = removeKeys(updatedUser?.val, [
            'password',
            'hashedRefreshToken',
            'verificationCodeHash',
            'verificationCodeExpires',
            "accountStatus"
        ]) as User;
        return Succeed({ user: pickedUser });


        // await this.emailService.sendWelcome(newUser.email)

    }

    async verifyCode(email: string, code: string): Promise<User> {
        const userToVerify = await this.usersService.findOneByEmailOrFail(email);

        const verificationCodeHashMatch = await this.cryptoService.verifyHash(
            userToVerify.verificationCodeHash,
            code,
        );
        console.log({ verificationCodeHashMatch })
        if (!verificationCodeHashMatch)
            return this.exception.invalidCodeVerification()
        if (userToVerify.verificationCodeExpires < Date.now())
            return this.exception.expiredCodeVerification()
        return userToVerify;
    }

    async login(input: LoginUserInput, response: Response): Promise<Resp<AuthTokenResponse>> {
        const user: Partial<User> = await this.loginValidateUser(input);
        const pickedUser = removeKeys(user, [
            'password',
            'hashedRefreshToken',
            'verificationCodeHash',
            'verificationCodeExpires',
            "accountStatus"
        ]) as User;
        const loginAuthToken: AuthToken = await this.generateAuthToken({
            id: user.id,
            role: user?.role,
        });

        if (!loginAuthToken) return FAIL(ResponseConst.INTERNAL_ERROR);
        const hashedRefreshToken = await this.cryptoService.createHash(loginAuthToken.refreshToken);
        await this.usersService.upsertOne(
            { id: user?.id },
            {
                hashedRefreshToken,
            },
        );
        this.cookieService.setAccessToken(response, loginAuthToken?.refreshToken)
        return Succeed({ authToken: loginAuthToken, userData: pickedUser });
    }

    async loginValidateUser(input: LoginUserInput): Promise<Partial<User>> {
        const { email, password } = input;
        const userToLogin = await this.usersService.findOneByEmailOrFail(email);
        if (userToLogin?.authProvider != AUTH_PROVIDER.CREDENTIAL) this.exception.invalidAuthProvider()
        const pwdHashMatch = await this.cryptoService.verifyHash(userToLogin.password, password);
        if (!pwdHashMatch) this.exception.userPasswordNotFound(email)
        return userToLogin;
    }

    public async generateAuthToken(payload: UserFromToken, update = false): Promise<AuthToken> {
        const sessionId = this.cryptoService.randomCode();
        const newPayload: UserFromToken = {
            id: payload.id,
            sessionId: update ? payload.sessionId : sessionId,
            role: payload.role,
        };

        const accessToken = await this.jwtService.signAccessToken(newPayload);
        const refreshToken = await this.jwtService.signRefreshToken(newPayload);
        const jwtExpiry = this.configService.getNumber("JWT_REFRESH_EXPIRY_TIME")



        return {
            accessToken,
            refreshToken,
            sessionId: newPayload.sessionId,
            expiresIn: Date.now() + Number(jwtExpiry)
        };
    }


    async logOut(request: Request, response: Response): Promise<Resp<boolean>> {
        try {
            const token = this.cookieService.getAccessToken(request)
            const user = await this.getUserFromRefreshToken(token);
            await this.usersService.upsertOne(
                { id: user.val.user.id },
                { hashedRefreshToken: '' },
            );
            this.cookieService.deleteAccessToken(response)
            return Succeed(true);
        } catch (e) {
            return FAIL(e.message);
        }
    }



    public async getUserFromRefreshToken(refreshToken: string): Promise<Resp<UserAndToken>> {
        if (!refreshToken) return null;
        const decoded = await this.jwtService.verifyRefreshToken(refreshToken);
        if (!decoded.ok) this.exception.invalidAccessToken()
        const user: User = await this.usersService.findOneByIdOrFail(decoded.val.id);
        const pickedUser = removeKeys(user, [
            'password',
            'hashedRefreshToken',
            'verificationCodeHash',
            'verificationCodeExpires',
        ]) as User;
        const isRefreshTokenMatching = await this.cryptoService.verifyHash(
            user.hashedRefreshToken,
            refreshToken,
        );
        if (!isRefreshTokenMatching) this.exception.invalidAccessToken()
        return Succeed({ usrToken: decoded.val, user: pickedUser });
    }



    async sendResetCode(email: string): Promise<Resp<string>> {
        try {
            const user = await this.usersService.findOneByEmailOrFail(email);
            const res = await this.sendCodeAndUpdateHash(user?.id);
            await this.event.emit<AuthenticationApplicationEvent.UserPasswordResetRequested.Payload>(
                AuthenticationApplicationEvent.UserPasswordResetRequested.key,
                { userId: user?.id, code: res?.val },
            )
            return Succeed(RespConst.VERIFICATION_SENT);
        } catch (e) {
            return FAIL(e.message);
        }
    }


    async resetPassword(input: ResetPasswordInput) {
        await this.verifyCode(input.email, input.code);
        const hashedPwd = await this.cryptoService.createHash(input.newPassword);
        const usr = await this.usersService.upsertOne(
            { email: input.email },
            {
                password: hashedPwd,
                verificationCodeExpires: 0,
                verificationCodeHash: ""
            },
        );
        if (!usr.ok) return FAIL(usr.errMessage, usr.code);
        return Succeed(RespConst.OPERATION_SUCCESS);

    }
}



