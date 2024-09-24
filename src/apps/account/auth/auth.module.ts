import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthenticationApplicationException } from './auth.exception';
import { UserModule } from '../user/user.module';
import { CryptoModule } from '@/core/crypto';
import { GoogleByAuthenticationController } from './authentication.google.controller';
import { GoogleModule } from '@/libraries/google';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy'; // assuming you have this folder
import { ConfigurationModule } from '@/core/configuration';


@Module({
    imports: [
        UserModule,
        CryptoModule,
        ConfigurationModule,
        GoogleModule,
        PassportModule.register({ defaultStrategy: 'google' })
    ],
    providers: [
        AuthService,
        AuthenticationApplicationException,
        GoogleStrategy

    ],
    controllers: [
        AuthController,
        GoogleByAuthenticationController
    ]
})
export class AuthModule { }



