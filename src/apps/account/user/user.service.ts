import { Injectable } from '@nestjs/common';
import { UserException } from './user.exception';
import { PrismaService } from 'src/core/database/prisma.service';
import { AdminStatus, Prisma, Profile, RoleType, User } from '@prisma/client';
import { Utility } from 'src/common/util/url';
import { ExtendedUser, FAIL, Resp, RoleEnum, Succeed } from 'src/common/constant';
import { ChangePasswordInput } from '../auth/dto/auth.input.dto';
import { CryptoService } from '@/core/crypto';
import { UpdateMeDto } from '../profile/dto/profile.dto';
import { CreateUser, UpdateUserWithRole } from './dto/user.dto';
import { PrismaGenericRepository } from '@/core/database/prisma.repository';
import { PaginatedResponse, PaginationInputs } from '@/common/dto/pagination.dto';
import { pickKeys, removeKeys } from '@/common/util/object';




@Injectable()
export class UserService {
    private readonly userRepository: PrismaGenericRepository<any>;
    constructor(
        private exception: UserException,
        private prismaService: PrismaService,
        private cryptoService: CryptoService
    ) {
        this.userRepository = new PrismaGenericRepository(this.prismaService.user);
    }

    async paginateUsers(
        filter: any,
        pagination: PaginationInputs,
    ): Promise<PaginatedResponse<any>> {
        const fieldsToSearch = ['fullName', 'email'];
        const data = await this.userRepository.filterAndSearchManyAndPaginate(
            filter,
            fieldsToSearch,
            pagination,
            {
                profile: true,
                _count: {
                    select: {
                        Product: {
                            where: {
                                adminStatus: AdminStatus?.APPROVED,
                            },
                        },
                    },
                },
            }
        );

        const refined = data?.values?.map(user => {
            const pickedUser = removeKeys(user, [
                'password',
                'hashedRefreshToken',
                'verificationCodeHash',
                'verificationCodeExpires',
                "accountStatus",
                "_count"
            ])
            const post = user?._count?.Product
            return { ...pickedUser, post }

        })
        return { ...data, values: refined }

    }


    async findOneByEmailOrFail(email: string, roles?: RoleType[]): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: email.trim(),
                active: true,
                ... (roles?.length && {
                    role: {
                        in: roles
                    }
                })
            },
        })
        if (!user) {
            this.exception.notFoundByEmail(email)
        }
        return user
    }

    async updateProfile(userId: string, input: UpdateMeDto,): Promise<ExtendedUser> {
        return await this.prismaService.user.update({
            where: {
                id: userId,
                active: true
            },
            data: {
                ...(
                    input.fullName && {
                        fullName: input.fullName
                    }
                ),
                profile: {
                    update: {
                        data: {
                            phone: input.phone,
                            address: input?.address,
                            avatar: input?.avatar
                        }
                    }
                }
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                firstTimeLogin: true,
                profile: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }
    async findUserWithProfileOrFail(id: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id, active: true },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                firstTimeLogin: true,
                profile: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!user) {
            this.exception.notFoundById(id)
        }
        return Succeed(user);
    }
    async findOneByEmail(email: string,): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: { email: email.trim(), },
        })
        return user
    }
    async findOneByTelegramUserId(userId: string,): Promise<User> {
        const user = await this.prismaService.user.findFirst({
            where: { telegramUserId: userId },
        })
        return user
    }
    async findOneByIdOrFail(id: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: { id, active: true },
        })
        if (!user) {
            this.exception.notFoundById(id)
        }
        return user
    }

    async findPopulatedByIdOrFail(id: string): Promise<ExtendedUser> {
        const user = await this.prismaService.user.findUnique({
            where: { id, active: true },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                firstTimeLogin: true,
                profile: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!user) {
            this.exception.notFoundById(id)
        }
        return user
    }
    async findOneById(id: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: { id, active: true },
        })
        return user
    }
    async findByIdAndDelete(id: string): Promise<Resp<User>> {
        try {
            const user = await this.prismaService.user.delete({
                where: { id, },
            })
            return Succeed(user)
        } catch (error) {
            return FAIL(error.message, 500);
        }

    }
    async updateById(id: string, input: UpdateUserWithRole): Promise<Resp<ExtendedUser>> {
        const { role, phone, address, ...rest } = input;
        try {
            const updatedUser = await this.prismaService.user.update({
                where: { id },
                data: {
                    ...rest,
                    ...(role && { role: role as RoleEnum }),  // Add role if present
                    profile: {
                        update: {
                            ...(phone && { phone }),  // Only update if phone is present
                            ...(address && { address }),  // Only update if address is present
                        },
                    },
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    profile: true,
                    active: true
                },
            });
            return Succeed(updatedUser)
        } catch (error) {
            return FAIL(error.message, 500);
        }

    }
    async findOneByEmailWithPassword(email: string): Promise<Partial<User>> {
        const user = await this.prismaService.user.findFirst({
            where: { email: email.trim(), active: true },
            select: {
                id: true,
                email: true,
                password: true,
                verificationCodeHash: true,
                role: true
            }
        })
        if (!user) {
            this.exception.notFoundByEmail(email)
        }

        return user
    }
    async registerUser(userInput: Partial<User>, phone?: string): Promise<User> {
        const user = {
            ...userInput,
        } as User

        if (user.email) {
            user.email = user.email.trim()
        }
        return this.prismaService.user.create({
            data: {
                ...user,
                profile: {
                    create: {
                        ... (phone && { phone: phone })
                    }
                }
            }
        })
    }
    async createUser(userInput: CreateUser): Promise<Resp<ExtendedUser>> {
        const { phone, address, ...rest } = userInput
        try {
            const user = await this.prismaService.user.create({
                data: {
                    ...rest,
                    role: userInput?.role as RoleEnum,
                    profile: {
                        create: {
                            address: address,
                            phone: phone
                        }
                    }
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    active: true,
                    profile: true,
                    createdAt: true,
                    updatedAt: true
                }
            })
            return Succeed(user)
        } catch (e) {
            return FAIL(e.message, 500);

        }

    }
    async upsertOne(filter: Prisma.UserWhereUniqueInput, input: Prisma.UserUpdateInput): Promise<Resp<User>> {
        try {
            const updated: User = await this.prismaService.user
                .update(
                    {
                        where: filter,
                        data: input
                    }
                )
            return Succeed(updated);
        } catch (e) {
            return FAIL(e.message, 500);
        }
    }

    async changePassword(id: string, input: ChangePasswordInput): Promise<Resp<string>> {
        const { newPassword, oldPassword } = input;
        if (newPassword === oldPassword) this.exception.passwordsAreSame()
        const changePwdUser = await this.findOneByIdOrFail(id);
        const pwdHashMatch = await this.cryptoService.verifyHash(changePwdUser.password, oldPassword);
        if (!pwdHashMatch) this.exception.oldPasswordDoesNotMatch()

        const newHash = await this.cryptoService.createHash(newPassword);
        const usr = await this.upsertOne(
            { id: id },
            {
                password: newHash,
                firstTimeLogin: false
            },
        );
        if (!usr.ok) return FAIL('Failed to update Pwd', 500);
        return Succeed('Successfully changed password');
    }
}

