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





@Module({
  imports: [
    CorsModule,
    LoggerModule,
    ExceptionModule,
    LoggingModule,
    PrismaModule,
    EmailModule,
    EventModule,
    CryptoModule,
    SocketModule
  ],
  controllers: [],
  providers: [
    ...ExceptionModule.getFilters(),
    ...LoggingModule.getInterceptors()
  ],
})
export class AppModule { }
