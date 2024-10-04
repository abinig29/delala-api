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
                vehicleDetail: {
                    include: {
                        carMake: true
                    }
                },
                jobDetail: {
                    include: {
                        jobCategory: true
                    }
                },
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
                                ... (jobInfo.jobCategoryId && {
                                    jobCategory: {
                                        connect: {
                                            id: jobInfo.jobCategoryId
                                        }
                                    }
                                }),
                                salary: jobInfo?.salary,
                                type: jobInfo?.type,
                                company: jobInfo?.company,
                                location: jobInfo.location

                            }
                        }
                    }),
                    ... (category === "VEHICLE" && vehicleInfo && {
                        vehicleDetail: {
                            create: {
                                ...(vehicleInfo.makeId && {
                                    carMake: {
                                        connect: {
                                            id: vehicleInfo.makeId
                                        }
                                    }
                                }),
                                model: vehicleInfo?.model,
                                price: vehicleInfo?.price,
                                type: vehicleInfo?.type,
                                condition: vehicleInfo?.condition,
                                fuelType: vehicleInfo?.fuelType,
                                transmission: vehicleInfo?.transmission,
                                year: vehicleInfo?.year,
                                mileage: vehicleInfo?.mileage,
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
            const foundProduct = await this.findPopulatedByIdOrFail(productId)
            const populatedOne = this.populatedData(foundProduct)
            console.log({ populatedOne })
            await this.prismaService.product.update({
                where: {
                    id: productId
                },
                data: {
                    ... (populatedOne === "propertyDetail" && {
                        propertyDetail: {
                            delete: {}
                        },
                    }),
                    ... (populatedOne === "classifiedDetail" && {
                        classifiedDetail: {
                            delete: {}
                        },
                    }),
                    ... (populatedOne === "vehicleDetail" && {
                        vehicleDetail: {
                            delete: {}
                        },
                    }),
                    ... (populatedOne === "serviceDetail" && {
                        serviceDetail: {
                            delete: {}
                        },
                    }),
                    ... (populatedOne === "jobDetail" && {
                        jobDetail: {
                            delete: {}
                        },
                    }),
                }
            })


            const product = await this.prismaService.product.update({
                where: {
                    id: productId
                },
                data: {
                    ...productInfo,
                    ...(category === "PROPERTY" && propertyInfo && {
                        propertyDetail: {
                            upsert: {
                                create: {
                                    ...propertyInfo
                                },
                                update: {
                                    ...propertyInfo
                                }
                            },
                        }
                    }),
                    ...(category === "VEHICLE" && vehicleInfo && {
                        vehicleDetail: {
                            upsert: {
                                create: {
                                    carMake: vehicleInfo?.makeId
                                        ? { connect: { id: vehicleInfo.makeId } }
                                        : undefined,
                                    model: vehicleInfo?.model,
                                    price: vehicleInfo?.price,
                                    type: vehicleInfo?.type,
                                    condition: vehicleInfo?.condition,
                                    fuelType: vehicleInfo?.fuelType,
                                    transmission: vehicleInfo?.transmission,
                                    year: vehicleInfo?.year,
                                    mileage: vehicleInfo?.mileage
                                },
                                update: {
                                    carMake: vehicleInfo?.makeId
                                        ? { connect: { id: vehicleInfo.makeId } }
                                        : undefined,
                                    model: vehicleInfo?.model,
                                    price: vehicleInfo?.price,
                                    type: vehicleInfo?.type,
                                    condition: vehicleInfo?.condition,
                                    fuelType: vehicleInfo?.fuelType,
                                    transmission: vehicleInfo?.transmission,
                                    year: vehicleInfo?.year,
                                    mileage: vehicleInfo?.mileage
                                }
                            },
                        }
                    }),
                    ...(category === "JOB" && jobInfo && {
                        jobDetail: {
                            upsert: {
                                create: {
                                    jobCategory: jobInfo?.jobCategoryId
                                        ? { connect: { id: jobInfo.jobCategoryId } }
                                        : undefined,
                                    salary: jobInfo?.salary,
                                    type: jobInfo?.type,
                                    company: jobInfo?.company,
                                    location: jobInfo?.location
                                },
                                update: {
                                    jobCategory: jobInfo?.jobCategoryId
                                        ? { connect: { id: jobInfo.jobCategoryId } }
                                        : undefined,
                                    salary: jobInfo?.salary,
                                    type: jobInfo?.type,
                                    company: jobInfo?.company,
                                    location: jobInfo?.location
                                }
                            },

                        }
                    }),
                    ...(category === "SERVICE" && serviceInfo && {
                        serviceDetail: {
                            upsert: {
                                create: {
                                    price: serviceInfo?.price,
                                    service: serviceInfo?.serviceId
                                        ? { connect: { id: serviceInfo.serviceId } }
                                        : undefined
                                },
                                update: {
                                    price: serviceInfo?.price,
                                    service: serviceInfo?.serviceId
                                        ? { connect: { id: serviceInfo.serviceId } }
                                        : undefined
                                }
                            },

                        }
                    }),
                    ...(category === "CLASSIFIED" && classifiedInfo && {
                        classifiedDetail: {
                            upsert: {
                                create: {
                                    price: classifiedInfo?.price,
                                    category: classifiedInfo?.categoryId
                                        ? { connect: { id: classifiedInfo.categoryId } }
                                        : undefined,
                                    subCategory: classifiedInfo?.subCategoryId
                                        ? { connect: { id: classifiedInfo.subCategoryId } }
                                        : undefined,
                                    lastCategory: classifiedInfo?.lastCategoryId
                                        ? { connect: { id: classifiedInfo.lastCategoryId } }
                                        : undefined
                                },
                                update: {
                                    price: classifiedInfo?.price,
                                    category: classifiedInfo?.categoryId
                                        ? { connect: { id: classifiedInfo.categoryId } }
                                        : undefined,
                                    subCategory: classifiedInfo?.subCategoryId
                                        ? { connect: { id: classifiedInfo.subCategoryId } }
                                        : undefined,
                                    lastCategory: classifiedInfo?.lastCategoryId
                                        ? { connect: { id: classifiedInfo.lastCategoryId } }
                                        : undefined
                                }
                            },
                        }
                    })
                }
            });


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


    async bulkDeleteProducts(ids: string[]): Promise<{ ok: boolean; val?: any; errMessage?: string; code?: number }> {
        console.log({ ids })
        try {
            const result = await this.prismaService.product.deleteMany({
                where: {
                    id: { in: ids },
                },
            });
            if (result.count === ids.length) {
                return Succeed(result)
            } else {
                return FAIL("Some products not found", 404)
            }
        } catch (error) {
            return FAIL(error.message, 500)
        }
    }


    populatedData(product: any): string {
        const populatedDetails = {
            propertyDetail: product?.propertyDetail || null,
            vehicleDetail: product?.vehicleDetail || null,
            jobDetail: product?.jobDetail || null,
            serviceDetail: product?.serviceDetail || null,
            classifiedDetail: product?.classifiedDetail || null,
        };

        // Find the first populated detail
        const firstPopulated = Object.entries(populatedDetails).find(
            ([_, value]) => value !== null
        );
        return firstPopulated ? firstPopulated[0] : 'No populated details';
    }
}

