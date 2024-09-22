import { Module } from '@nestjs/common';
import { CorsModule } from './core/cors';
import { LoggerModule } from './libraries/logger';
import { ExceptionModule } from './core/exception';
import { LoggingModule } from './core/logging';
import { PrismaModule } from './core/database';
import { CryptoModule } from './core/crypto';
import { EmailModule } from './libraries/email';
import { EventModule } from './libraries/event';
import { SocketModule } from './libraries/socket';
import { AuthModule } from './apps/account/auth/auth.module';
import { AppInfrastructureModule } from './app.infrastructure.module';
import { ConfigurationModule } from './core/configuration';
import { CookieModule } from './core/cookie';
import { GuardsModule } from './core/guard/guards.module';
import { ProfileModule } from './apps/account/profile/profile.module';
import { UserModule } from './apps/account/user/user.module';
import { ProductModule } from './apps/product/product.module';
import { InquiryModule } from './apps/inquiry/inquiry.module';
import { UploadModule } from './libraries/upload';
import { UploadApplicationModule } from './apps/upload/upload.module';
import { ServiceModule } from './apps/service/service.module';
import { ClassifiedModule } from './apps/classified/classified.module';



@Module({
  imports: [
    CorsModule,
    LoggerModule,
    ExceptionModule,
    CookieModule,
    LoggingModule,
    PrismaModule,
    EmailModule,
    ConfigurationModule,
    EventModule,
    CryptoModule,
    SocketModule,
    GuardsModule,
    AuthModule,
    AppInfrastructureModule,
    ProfileModule,
    UserModule,
    ProductModule,
    InquiryModule,
    UploadModule,
    ClassifiedModule,
    ServiceModule,
    UploadApplicationModule
  ],
  controllers: [],
  providers: [
    ...ExceptionModule.getFilters(),
    ...LoggingModule.getInterceptors()
  ],
})
export class AppModule { }
