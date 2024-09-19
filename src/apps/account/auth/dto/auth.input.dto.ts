import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginUserInput {
    @ApiProperty({ description: 'The phone number or email of the user', example: 'user@example.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The password of the user', example: 'Password123', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;
}


export class RegisterUserInput {
    @ApiPropertyOptional({ description: 'The email address of the user', example: 'user@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'The password of the user', example: 'Password123', minLength: 6 })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ description: 'The full name of the user', example: 'John Doe' })
    @IsOptional()
    @IsString()
    fullName?: string;
}

export class VerifyCodeInput {
    @ApiProperty({ description: 'The email address of the user', example: 'user@example.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The verification code sent to the user', example: '123456' })
    @IsString()
    @IsNotEmpty()
    code: string;
}

export class EmailInput {
    @ApiProperty({ description: 'The email address of the user', example: 'user@example.com' })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}




export class ResetPasswordInput {
    @ApiProperty({
        description: 'The email address associated with the user account',
        example: 'user@example.com',
    })
    @IsString()
    email: string;

    @ApiProperty({
        description: 'The reset code sent to the user’s email',
        example: '123456',
    })
    @IsString()
    code: string;

    @ApiProperty({
        description: 'The new password for the user account',
        example: 'newpassword123',
    })
    @MinLength(6)
    @IsString()
    newPassword: string;

    @ApiProperty({
        description: 'Whether to reset all active sessions for the user',
        example: true,
    })
    @IsBoolean()
    resetAllSessions: boolean;
}






export class ChangePasswordInput {
    @ApiProperty({
        description: 'The current password of the user',
        example: 'oldpassword123',
    })
    @IsString()
    oldPassword: string;

    @ApiProperty({
        description: 'The new password for the user',
        example: 'newpassword123',
    })
    @MinLength(6)
    @IsString()
    newPassword: string;
}



export class GoogleByAuthenticationCallbackDto {
    @ApiProperty({
        description: 'The token you receive from google',
    })
    @IsString()
    @IsNotEmpty()
    token: string
}
