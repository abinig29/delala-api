import { Module } from '@nestjs/common'
import { AuthenticationInfrastructureModule } from './apps/account/auth/infrastructure'
import { UserInfrastructureModule } from './apps/account/user/infrastructure'
// import { NotificationInfrastructureModule } from './notification/infrastructure'
import { InquiryModule } from './apps/inquiry/inquiry.module';


@Module({
  imports: [
    AuthenticationInfrastructureModule,
    // NotificationInfrastructureModule,
    UserInfrastructureModule,
    InquiryModule
  ],
  controllers: [],
  providers: [],
})
export class AppInfrastructureModule { }
