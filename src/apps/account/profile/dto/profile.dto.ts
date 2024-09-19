import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateMeDto {
    @ApiPropertyOptional({ description: 'The Full name  of the user', example: 'jon doe' })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({ description: 'The Phone of the user', example: '0911931810' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'The profile image of the user', example: 'http:img' })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiPropertyOptional({ description: 'The Address of the user', example: 'Mexico' })
    @IsOptional()
    @IsString()
    address?: string;
}