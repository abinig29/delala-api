import {
  Body,
  Controller,
  Get,
  HttpException,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { UpdateMeDto } from './dto/profile.dto';
import { JwtGuard, UserService } from './dependencies.profile';
import { Express, Request } from 'express';
import { User } from '@prisma/client';
import { Endpoint } from '@/common/constant/endpoint.const';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExtendedUser, UserFromToken } from '@/common/constant';
import { CurUser } from '@/core/guard';

@Controller(Endpoint.Profile)
@ApiTags(Endpoint.Profile)
export class ProfileController {
  constructor(
    private usersService: UserService,
  ) { }

  @Get('')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async getMe(@Req() req: Request, @CurUser() user: UserFromToken) {
    const res = await this.usersService.findUserWithProfileOrFail(user.id);
    return res.val;
  }


  @Patch()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async updateMe(
    @Req() req: Request,
    @Body() input: UpdateMeDto,
    @CurUser() user: UserFromToken
  ): Promise<ExtendedUser> {
    const res = await this.usersService.updateProfile(user.id, input);
    return res;
  }
}