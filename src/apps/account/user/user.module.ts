import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserException } from './user.exception';
import { UsersController } from './users.controller';

@Module({
    providers: [UserService, UserException],
    controllers: [UsersController],
    exports: [UserService]
})
export class UserModule { }
