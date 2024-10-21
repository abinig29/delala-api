import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  UseGuards,
  Query,
  ConflictException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Endpoint, ExtendedUser } from '@/common/constant';
import { CreateUser, FilterUser, FilterUserWithPagination, UpdateUserWithRole } from './dto/user.dto';
import { RoleType, User } from '@prisma/client';
import { CryptoService } from '@/core/crypto';
import { Roles } from '@/core/guard/roles.decorators';
import { JwtGuard } from '@/core/guard';
import { pagiKeys, PaginatedResponse, } from '@/common/dto/pagination.dto';
import { pickKeys, removeKeys } from '@/common/util/object';
import { EventService } from '@/libraries/event';
import { UserApplicationEvent } from './user.event';



@Controller(Endpoint.Users)
@ApiTags(Endpoint.Users)
export class UsersController {
  constructor(private readonly usersService: UserService, private cryptoService: CryptoService, private event: EventService) { }


  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUser })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async createUser(@Body() createDto: CreateUser): Promise<ExtendedUser> {
    const user = await this.usersService.findOneByEmail(createDto?.email)
    if (user) throw new ConflictException("The provided email is already in use.");
    const password = "admin123"
    const hashedPassword = await this.cryptoService.createHash(password);
    createDto.active = false;
    const resp = await this.usersService.createUser({ ...createDto, password: hashedPassword, role: RoleType.ADMIN });
    if (!resp.ok) throw new HttpException(resp.errMessage, resp.code);
    await this.event.emit<UserApplicationEvent.AdminRegistered.Payload>(
      UserApplicationEvent.AdminRegistered.key,
      { userId: resp?.val.id, password },
    )
    return resp.val;
  }



  @Get("merchant")
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch  merchants' })
  async findMany(@Query() inputQuery: FilterUserWithPagination): Promise<PaginatedResponse<User>> {
    const paginateQuery = pickKeys(inputQuery, [...pagiKeys, 'searchText']);
    const query = removeKeys(inputQuery, [...pagiKeys, 'searchText']);
    const res = await this.usersService.paginateUsers(
      {
        ...query,
        role: RoleType.USER
      },
      paginateQuery,
    );
    return res
  }

  @Get("admin")
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch  merchants' })
  async findManyAdmin(@Query() inputQuery: FilterUserWithPagination): Promise<PaginatedResponse<User>> {
    const paginateQuery = pickKeys(inputQuery, [...pagiKeys, 'searchText']);
    const query = removeKeys(inputQuery, [...pagiKeys, 'searchText']);
    const res = await this.usersService.paginateUsers(
      {
        ...query,
        role: RoleType.ADMIN
      },
      paginateQuery,
    );
    return res
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN)
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string): Promise<ExtendedUser> {
    const res = await this.usersService.findPopulatedByIdOrFail(id);
    return res;
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserWithRole): Promise<ExtendedUser> {
    const res = await this.usersService.updateById(id, updateUserDto);
    if (!res.ok) throw new HttpException(res.errMessage, res.code);
    return res.val;
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtGuard)
  async remove(@Param('id') id: string): Promise<User> {
    const res = await this.usersService.findByIdAndDelete(id);
    if (!res.ok) throw new HttpException(res.errMessage, res.code);
    return res.val;
  }
}
