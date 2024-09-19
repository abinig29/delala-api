import { BadRequestException, Body, Controller, HttpException, Patch, Post, Req, Res, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Endpoint, RespConst, UserFromToken } from 'src/common/constant';
import { AuthService } from './auth.service';
import { ChangePasswordInput, EmailInput, LoginUserInput, RegisterUserInput, ResetPasswordInput, VerifyCodeInput } from './dto/auth.input.dto';
import { AuthTokenResponse } from './dto/auth.response.dto';
import { Response, Request } from 'express';
import { CurUser, JwtGuard } from '@/core/guard';
import { UserService } from '../user/user.service';
import { CreateUser } from '../user/dto/user.dto';

@Controller(Endpoint.Auth)
@ApiTags(Endpoint.Auth)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private usersService: UserService,

    ) { }

    @Post('signup')
    @ApiOperation({ summary: 'Register a new user and send verification code' })
    @ApiBody({ type: RegisterUserInput })
    @ApiResponse({
        status: 200, description: 'User registered successfully and verification code sent',
        schema: { example: { message: 'Verification code sent to email' } }
    })
    @ApiResponse({
        status: 409,
        description: 'Email is not available',
        schema: {
            example: {
                statusCode: 409,
                message: 'Email is not available',
                data: { code: 5 },
                timestamp: new Date().toISOString(),

            }
        }
    })
    async registerAndSendCode(
        @Body() body: CreateUser,
    ) {
        const resp = await this.authService.registerWithEmailCode(body);
        if (!resp.ok) throw new HttpException(resp.errMessage, resp.code);
        return { message: resp.val };
    }





    @Post('activate')
    @ApiOperation({ summary: 'Activate user account with verification code' })
    @ApiBody({ type: VerifyCodeInput })
    @ApiResponse({ status: 200, description: 'Account activated successfully' })
    @ApiResponse({
        status: 400, description: 'Bad Request',
        schema: {
            example:
            {
                statusCode: 403,
                message: 'Code is incorrect',
                data: { code: 8 },
                timestamp: new Date().toISOString(),
            }
        }
    })
    async activateWithCode(@Body() input: VerifyCodeInput) {
        const userResponse = await this.authService.activateAccountByCode(
            input.email,
            input.code,
        );
        return userResponse.val;
    }








    @Post('login')
    @ApiOperation({ summary: 'Login a user with email and password' })
    @ApiBody({ type: LoginUserInput })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: AuthTokenResponse,
    })

    async login(
        @Res({ passthrough: true }) response: Response,
        @Body() input: LoginUserInput,
    ): Promise<AuthTokenResponse> {
        const res = await this.authService.login(input, response);
        return res.val;
    }




    @Post('/logout')
    @ApiOperation({ summary: 'Logout the current user' })
    @ApiResponse({
        status: 200,
        description: 'Logout successful',
        schema: {
            example: { message: 'Logout successful' },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
        schema: {
            example: { statusCode: 400, message: 'Logout failed', error: 'Bad Request' },
        },
    })
    async logout(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
        const resp = await this.authService.logOut(request, response);
        if (!resp.ok) throw new HttpException(resp.errMessage, resp.code);
        return { message: 'Logout successful' };
    }






    @Post('forgotPassword')
    @ApiOperation({ summary: 'Send password reset code to the user’s email' })
    @ApiBody({
        description: 'Email address of the user',
        type: EmailInput,
    })
    @ApiResponse({
        status: 200,
        description: 'Reset code sent successfully',
        schema: {
            example: { message: RespConst.VERIFICATION_SENT },
        },
    })
    async forgotPassword(@Body() input: EmailInput) {
        const res = await this.authService.sendResetCode(input.email);
        if (!res.ok) throw new HttpException(res.errMessage, res.code);
        return { message: res.val };
    }





    @Post('resetPassword')
    @ApiOperation({ summary: 'Reset the user password using a reset code' })
    @ApiBody({ type: ResetPasswordInput })
    @ApiResponse({
        status: 200,
        description: 'Password reset successfully',
        schema: {
            example: { message: RespConst.OPERATION_SUCCESS },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
        schema: {
            example: { statusCode: 400, message: 'Invalid reset code or password', error: 'Bad Request' },
        },
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
        schema: {
            example: { statusCode: 500, message: 'Internal server error', error: 'Internal Server Error' },
        },
    })
    async resetPassword(@Body() input: ResetPasswordInput): Promise<Object> {
        const resp = await this.authService.resetPassword(input);
        return { message: resp.val }
    }










    @Patch('changePassword')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change the user password' })
    @ApiBody({ type: ChangePasswordInput })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        schema: {
            example: { message: ' Successfully changed password' },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
        schema: {
            example: {
                statusCode: 400,
                message: 'Invalid old password or new password',
                error: 'Bad Request'
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
        schema: {
            example: {
                statusCode: 401,
                message: 'Unauthorized',
                error: 'Unauthorized'
            },
        },
    })
    async ChangePassword(@Req() req: Request, @Body() input: ChangePasswordInput, @CurUser() user: UserFromToken) {
        const ans = await this.usersService.changePassword(user.id, input);
        if (!ans.ok) throw new HttpException(ans.errMessage, ans.code);
        return { message: ans.val };

    }




    @Post('resetTokens')
    @ApiOperation({ summary: 'Reset and refresh access and refresh tokens' })
    @ApiResponse({
        status: 200,
        description: 'Tokens refreshed successfully',
        type: AuthTokenResponse,
        schema: {
            example: {
                authToken: {
                    accessToken: 'new-access-token',
                    refreshToken: 'new-refresh-token',
                    sessionId: 'session-id',
                    expiresIn: 3600
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or expired token',
        schema: {
            example: {
                statusCode: 401,
                message: 'Unauthorized - Token expired or invalid',
                error: 'Unauthorized'
            }
        }
    })
    async resetTokens(
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request,
    ): Promise<AuthTokenResponse> {
        const token = this.authService.getTokenFromCookie(request)
        const resp = await this.authService.resetTokens(token, response);
        return resp.val;
    }



}

