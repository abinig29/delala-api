import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthenticationApplicationException } from './auth.exception';
import { UserModule } from '../user/user.module';
import { CryptoModule } from '@/core/crypto';
import { GoogleByAuthenticationController } from './authentication.google.controller';
import { GoogleModule } from '@/libraries/google';

@Module({
    imports: [
        UserModule,
        CryptoModule,
        GoogleModule
    ],
    providers: [
        AuthService,
        AuthenticationApplicationException,

    ],
    controllers: [AuthController, GoogleByAuthenticationController]
})
export class AuthModule { }
