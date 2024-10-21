import { ApiHideProperty, ApiProperty, IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsNotEmpty, IsBoolean, IsEmpty } from 'class-validator';
import { RegisterUserInput } from '../../auth/dto/auth.input.dto';
import { RoleType } from '@prisma/client';
import { PaginationInputs } from '@/common/dto/pagination.dto';

export class UserDto {
    @ApiProperty({ description: 'The unique identifier of the user', example: '1' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'The email address of the user', example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The full name of the user', example: 'John Doe' })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiProperty({ description: 'The role of the user', example: 'USER' })
    @IsString()
    @IsOptional()
    role?: string;

}


export class CreateUser extends OmitType(UserDto, ['id']) {

    @ApiProperty({ description: 'The phone number of the user', example: '0911931810' })
    @IsString()
    @IsOptional()
    phone?: string;


    @IsString()
    @IsOptional()
    password?: string;

    @ApiProperty({ description: 'The address of the user', example: 'Mexico' })
    @IsString()
    @IsOptional()
    address?: string;


    @ApiHideProperty()
    @IsBoolean()
    @IsOptional()
    active?: boolean;


}



export class FilterUser extends PartialType(OmitType(CreateUser, ['password', "address", "phone", "role"])) { }

export class FilterUserWithPagination extends IntersectionType(
    FilterUser,
    PaginationInputs,
) { }

export class UpdateUserWithRole extends PartialType(OmitType(CreateUser, ['email', 'password'])) { }