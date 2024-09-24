import { IsString, IsOptional, IsArray, IsEnum, IsInt, IsNumber, IsUrl, ValidateNested, IsUUID } from 'class-validator';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional, IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductStatus, PropertyType, ProductIntent, FurnishingStatus, VehicleType, FuelType, TransmissionType, VehicleCondition, AdminStatus, ProductCategory, JobType } from '@prisma/client';
import { PaginationInputs } from '@/common/dto/pagination.dto';



export class CreatePropertyDetailsDto {
    @ApiProperty({ enum: PropertyType, description: 'Type of property' })
    @IsEnum(PropertyType)
    type: PropertyType;


    @ApiProperty({ enum: ProductIntent, description: 'Sale or rental status of the property' })
    @IsEnum(ProductIntent)
    intent: ProductIntent;

    @ApiProperty({ description: 'Price of the property' })
    price: number;

    @ApiProperty({ description: 'Location of the property' })
    @IsString()
    location: string;

    @ApiPropertyOptional({ description: 'Number of bedrooms', type: Number })
    @IsOptional()
    @IsInt()
    bedrooms?: number;

    @ApiPropertyOptional({ description: 'Number of bathrooms', type: Number })
    @IsOptional()
    @IsInt()
    bathrooms?: number;

    @ApiProperty({ enum: FurnishingStatus, description: 'Furnishing status of the property' })
    @IsEnum(FurnishingStatus)
    furnishing: FurnishingStatus;

    @ApiPropertyOptional({ description: 'Area of the property in square meters', type: Number })
    @IsOptional()
    @IsNumber()
    area?: number;
}

export class CreateJobDetailsDto {
    @ApiProperty({ enum: JobType, description: 'Type of the job' })
    @IsEnum(JobType)
    type: JobType;

    @ApiPropertyOptional({ description: 'Company offering the job' })
    @IsOptional()
    @IsString()
    company?: string;

    @ApiPropertyOptional({ description: 'Location of the job' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ description: 'Salary for the job' })
    @IsOptional()
    @IsNumber()
    salary?: number;

    @ApiPropertyOptional({ description: 'Description of the job' })
    @IsOptional()
    @IsString()
    description?: string;
}


export class CreateVehicleDetailsDto {
    @ApiProperty({ enum: VehicleType, description: 'Type of vehicle' })
    @IsEnum(VehicleType)
    type: VehicleType;

    @ApiProperty({ description: 'Make of the vehicle' })
    @IsString()
    make: string;

    @ApiProperty({ description: 'Model of the vehicle' })
    @IsString()
    model: string;

    @ApiProperty({ description: 'Year of manufacturing' })
    @IsInt()
    year: number;

    @ApiProperty({ description: 'Price of the vehicle' })
    @IsNumber()
    price: number;

    @ApiProperty({ enum: FuelType, description: 'Type of fuel used by the vehicle' })
    @IsEnum(FuelType)
    fuelType: FuelType;

    @ApiProperty({ enum: TransmissionType, description: 'Transmission type of the vehicle' })
    @IsEnum(TransmissionType)
    transmission: TransmissionType;

    @ApiProperty({ description: 'Mileage of the vehicle in kilometers' })
    @IsNumber()
    mileage: number;


    @ApiProperty({ enum: VehicleCondition, description: 'Condition of the vehicle (new or used)' })
    @IsEnum(VehicleCondition)
    condition: VehicleCondition;
}

export class CreateServiceDetailsDto {
    @ApiProperty({ description: 'Price of the service', example: 10 })
    @IsNumber()
    price: number;

    @ApiProperty({ description: 'ID of the service' })
    @IsUUID()
    serviceId: string;
}

export class CreateClassifiedDetailsDto {
    @ApiProperty({ description: 'Price of the service', example: 10 })
    @IsNumber()
    price: number;

    @ApiProperty({ description: 'main category ID' })
    @IsUUID()
    @IsOptional()
    categoryId: string;


    @ApiProperty({ description: 'sub category ID' })
    @IsUUID()
    @IsOptional()
    subCategoryId: string;

    @ApiProperty({ description: 'last category ID' })
    @IsUUID()
    @IsOptional()
    lastCategoryId: string;
}






export class CreateProductDto {
    @ApiProperty({ description: 'Name of the product', example: "bole22 nice house" })
    @IsString()
    name: string;


    @ApiHideProperty()
    @IsOptional()
    slug: string;


    @ApiPropertyOptional({ description: 'Description of the product', example: "bole22 nice house" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Features of the product', example: "nice house with pool" })
    @IsString()
    features: string;

    @ApiProperty({ description: 'Array of image URLs for the product', type: [String], example: ["https://th.bing.com/th/id/OIP.prNDA8k-tl9i_UXvUiWCVQHaEC?w=307&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"] })
    @IsArray()
    @IsString({ each: true })
    images: string[];

    @ApiPropertyOptional({ enum: ProductStatus, description: 'Status of the product' })
    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;

    @ApiHideProperty()
    @IsEnum(AdminStatus)
    @IsOptional()
    adminStatus?: AdminStatus;

    @ApiProperty({ enum: ProductCategory, description: 'General category (e.g., Property, Vehicle)', })
    @IsEnum(ProductCategory)
    category: ProductCategory;

    @ApiPropertyOptional({ description: 'Property-specific details', type: CreatePropertyDetailsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreatePropertyDetailsDto)
    propertyDetail?: CreatePropertyDetailsDto;

    @ApiPropertyOptional({ description: 'Vehicle-specific details', type: CreateVehicleDetailsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateVehicleDetailsDto)
    vehicleDetail?: CreateVehicleDetailsDto;

    @ApiPropertyOptional({ description: 'Job-specific details', type: CreateJobDetailsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateJobDetailsDto)
    jobDetail?: CreateJobDetailsDto;



    @ApiPropertyOptional({ description: 'Service-specific details', type: CreateServiceDetailsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateServiceDetailsDto)
    serviceDetail?: CreateServiceDetailsDto;


    @ApiPropertyOptional({ description: 'Classified-specific details', type: CreateClassifiedDetailsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateClassifiedDetailsDto)
    classifiedDetail?: CreateClassifiedDetailsDto;



}




export class UpdateProductAdminStatusDto {
    @ApiProperty({ enum: AdminStatus, description: 'Admin Status of product' })
    @IsEnum(AdminStatus)
    status: AdminStatus;
}
export class UpdateProductStatusDto {
    @ApiProperty({ enum: ProductStatus, description: 'Status of product' })
    @IsEnum(ProductStatus)
    status: ProductStatus;
}



export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ['adminStatus'])) { }

export class FilterProduct extends PartialType(OmitType(CreateProductDto, ["images", "features", "description", "propertyDetail", "vehicleDetail", "status"])) { }

export class FilterProductWithPagination extends IntersectionType(
    FilterProduct,
    PaginationInputs,
) { }


export class ProductDto extends CreateProductDto {
    @ApiProperty({ description: 'Description of the product' })
    @IsString()
    id: string;
}

export class BulkDeleteProductDto {
    @IsArray()
    @IsString({ each: true })
    @ApiProperty({
        type: [String],
        description: 'Array of product IDs to delete',
    })
    ids: string[];
}