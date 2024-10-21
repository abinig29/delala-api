import { Module } from '@nestjs/common'
import { UserModule } from '@/apps/account/user/user.module'
import { AuthModule } from '@/apps/account/auth/auth.module'
import { TelegramService } from './telegram.service'

@Module({
    imports: [
        UserModule,
        AuthModule
    ],
    providers: [TelegramService],
    exports: [],
})
export class TelegramModule { }
