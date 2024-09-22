import { Injectable } from '@nestjs/common';
import { ProductException } from './product.exception';
import { PrismaService } from 'src/core/database/prisma.service';
import { AdminStatus, Prisma, Product, ProductCategory, ProductStatus, PropertyDetail, VehicleDetails, } from '@prisma/client';
import { FAIL, Resp, RoleEnum, Succeed } from 'src/common/constant';
import { CreateProductDto, UpdateProductAdminStatusDto, UpdateProductDto, UpdateProductStatusDto } from './dto/product.input.dto';
import { PrismaGenericRepository } from '@/core/database/prisma.repository';
import { PaginatedResponse, PaginationInputs } from '@/common/dto/pagination.dto';
import { pickKeys, removeKeys } from '@/common/util/object';
import { ExtendedProduct, productCategoryKeys } from './dto/product.type';




@Injectable()
export class ProductService {
    private readonly productRepository: PrismaGenericRepository<any>;
    constructor(
        private exception: ProductException,
        private prismaService: PrismaService,
    ) {
        this.productRepository = new PrismaGenericRepository(this.prismaService.product);
    }

    async paginateProducts(
        filter: any,
        pagination: PaginationInputs,
    ): Promise<PaginatedResponse<any>> {
        const fieldsToSearch = ['name'];
        const data = await this.productRepository.filterAndSearchManyAndPaginate(
            filter,
            fieldsToSearch,
            pagination,
        );
        return data

    }
    async findOneByIdOrFail(id: string): Promise<Product> {
        const product = await this.prismaService.product.findUnique({
            where: { id },
        })
        if (!product) {
            this.exception.notFoundById(id)
        }
        return product
    }
    async findPopulatedByIdOrFail(id: string): Promise<ExtendedProduct> {
        const product = await this.prismaService.product.findUnique({
            where: { id },
            include: {
                propertyDetail: true,
                vehicleDetail: true,
                jobDetail: true,
                serviceDetail: {
                    include: {
                        service: true
                    }
                },
                classifiedDetail: {
                    include: {
                        category: true,
                        subCategory: true,
                        lastCategory: true
                    }
                }
            }
        })
        if (!product) {
            this.exception.notFoundById(id)
        }
        return product
    }

    async findOneById(id: string): Promise<Product> {
        const product = await this.prismaService.product.findUnique({
            where: { id },
        })
        return product
    }

    async findByIdAndChangeStatus(id: string, updateProductStatusDto: UpdateProductStatusDto): Promise<Resp<Product>> {
        try {
            const product = await this.prismaService.product.update({
                where: { id, },
                data: {
                    status: updateProductStatusDto?.status


                }
            })
            return Succeed(product)
        } catch (error) {
            return FAIL(error.message, 500);
        }
    }

    async updateProductView(id: string): Promise<Resp<Product>> {
        try {
            const product = await this.prismaService.product.update({
                where: { id, },
                data: {
                    totalViews: {
                        increment: 1
                    }
                }
            })
            return Succeed(product)
        } catch (error) {
            return FAIL(error.message, 500);
        }
    }

    async findByIdAndChangeAdminStatus(id: string, updateProductAdminStatusDto: UpdateProductAdminStatusDto): Promise<Resp<Product>> {
        try {
            const product = await this.prismaService.product.update({
                where: { id, },
                data: {
                    adminStatus: updateProductAdminStatusDto?.status as AdminStatus
                }
            })
            return Succeed(product)
        } catch (error) {
            return FAIL(error.message, 500);
        }
    }

    async createProduct(productInput: CreateProductDto, userId: string): Promise<Resp<ExtendedProduct>> {
        try {
            const productInfo = removeKeys(productInput, productCategoryKeys) as Partial<Product>;
            const category = productInput?.category as ProductCategory
            const propertyInfo = productInput?.propertyDetail
            const vehicleInfo = productInput?.vehicleDetail
            const jobInfo = productInput?.jobDetail
            const serviceInfo = productInput?.serviceDetail
            const classifiedInfo = productInput?.classifiedDetail

            const product = await this.prismaService.product.create({
                data: {
                    name: productInfo?.name,
                    description: productInfo?.description,
                    features: productInfo?.features,
                    category: productInfo?.category,
                    slug: productInfo?.slug,
                    images: productInfo?.images,

                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    ... (category === "PROPERTY" && propertyInfo && {
                        propertyDetail: {
                            create: {
                                ...propertyInfo
                            }
                        }
                    }),
                    ... (category === "JOB" && jobInfo && {
                        jobDetail: {
                            create: {
                                ...jobInfo
                            }
                        }
                    }),
                    ... (category === "VEHICLE" && vehicleInfo && {
                        vehicleDetail: {
                            create: {
                                ...vehicleInfo
                            }
                        }
                    }),


                    ... (category === "SERVICE" && serviceInfo && {
                        serviceDetail: {
                            create: {
                                price: serviceInfo?.price,
                                service: {
                                    connect: {
                                        id: serviceInfo?.serviceId
                                    }
                                }
                            }
                        }
                    }),
                    ... (category === "CLASSIFIED" && classifiedInfo && {
                        classifiedDetail: {
                            create: {
                                price: classifiedInfo?.price,
                                ...(classifiedInfo?.categoryId && {
                                    category: {
                                        connect: {
                                            id: classifiedInfo?.categoryId
                                        }
                                    }
                                }),
                                ...(classifiedInfo?.subCategoryId && {
                                    subCategory: {
                                        connect: {
                                            id: classifiedInfo?.subCategoryId
                                        }
                                    }
                                }),
                                ...(classifiedInfo?.lastCategoryId && {
                                    lastCategory: {
                                        connect: {
                                            id: classifiedInfo?.lastCategoryId
                                        }
                                    }
                                })

                            }
                        }
                    })



                },
            })
            console.log({ product })
            return Succeed(product)
        } catch (e) {
            return FAIL(e.message, 500);

        }

    }

    async updateProduct(productInput: UpdateProductDto, productId: string): Promise<Resp<ExtendedProduct>> {
        try {
            const productInfo = removeKeys(productInput, productCategoryKeys) as Partial<Product>;
            const category = productInput?.category as ProductCategory
            const propertyInfo = productInput?.propertyDetail
            const vehicleInfo = productInput?.vehicleDetail
            const jobInfo = productInput?.jobDetail
            const serviceInfo = productInput?.serviceDetail
            const classifiedInfo = productInput?.classifiedDetail

            const product = await this.prismaService.product.update({
                where: {
                    id: productId
                },
                data: {
                    ...productInfo,
                    ... (category === "PROPERTY" && propertyInfo && {
                        propertyDetail: {
                            update: {
                                ...propertyInfo
                            }
                        }
                    }),
                    ... (category === "VEHICLE" && vehicleInfo && {
                        vehicleDetail: {
                            update: {
                                ...vehicleInfo
                            }
                        }
                    }),
                    ... (category === "JOB" && jobInfo && {
                        jobDetail: {
                            update: {
                                ...jobInfo
                            }
                        }
                    }),
                    ... (category === "SERVICE" && serviceInfo && {
                        serviceDetail: {
                            update: {
                                ... (serviceInfo?.price && { price: serviceInfo?.price, }),
                                ...  (serviceInfo?.serviceId && {
                                    service: {
                                        connect: {
                                            id: serviceInfo?.serviceId
                                        }
                                    }
                                })
                            }
                        }
                    }),
                    ... (category === "CLASSIFIED" && classifiedInfo && {
                        classifiedDetail: {
                            update: {
                                ... (classifiedInfo?.price && { price: classifiedInfo?.price, }),
                                ...(classifiedInfo?.categoryId && {
                                    category: {
                                        connect: {
                                            id: classifiedInfo?.categoryId
                                        }
                                    }
                                }),
                                ...(classifiedInfo?.subCategoryId && {
                                    subCategory: {
                                        connect: {
                                            id: classifiedInfo?.subCategoryId
                                        }
                                    }
                                }),
                                ...(classifiedInfo?.lastCategoryId && {
                                    lastCategory: {
                                        connect: {
                                            id: classifiedInfo?.lastCategoryId
                                        }
                                    }
                                })

                            }
                        }
                    })
                },

            })
            return Succeed(product)
        } catch (e) {
            return FAIL(e.message, 500);

        }

    }

    async deleteProduct(id: string) {
        try {
            const product = await this.findOneByIdOrFail(id)
            await this.prismaService.product.delete({
                where: { id }
            })
            return Succeed(true)
        } catch (error) {
            return FAIL(error?.message, 500)
        }
    }
}

