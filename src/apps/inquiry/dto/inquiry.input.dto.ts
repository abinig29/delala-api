
import { PaginationInputs } from '@/common/dto/pagination.dto';
import { ApiProperty, IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { InquiryStatus } from '@prisma/client';
import { IsString, IsOptional, IsEnum } from 'class-validator';



export class InquiryDto {
    @ApiProperty({ description: 'The unique identifier of the user', example: '1' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'The name of the inquirer', example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'The phone number of the inquirer', example: '0911931810' })
    @IsString()
    phone: string;

    @ApiProperty({ description: 'The email of the inquirer', example: 'johndoe@example.com' })
    @IsString()
    email: string;

    @ApiProperty({ description: 'A note or additional information about the inquiry', example: 'Looking for more details about the product.' })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty({ description: 'The ID of the product related to the inquiry' })
    @IsString()
    productId: string;
}



export class CreateInquiryDto extends OmitType(InquiryDto, ['id']) {

}


export class UpdateInquiryStatusDto {
    @ApiProperty({ enum: InquiryStatus, description: ' Status of Inquiry' })
    @IsEnum(InquiryStatus)
    status: InquiryStatus;
}


export class FilterInquiry extends PartialType(OmitType(CreateInquiryDto, ['productId', "note", "phone"])) { }

export class FilterInquiryWithPagination extends IntersectionType(
    FilterInquiry,
    PaginationInputs,
) { }