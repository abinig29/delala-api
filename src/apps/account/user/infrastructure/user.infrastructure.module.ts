import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { UserModule } from '../user.module'
import { EmailModule } from 'src/libraries/email'
import { UserCommunicationSubscriber } from './subscribers/user.communication.subscriber'


@Global()
@Module({
  imports: [
    UserModule,
    EmailModule],
  providers: [
    UserCommunicationSubscriber,
  ],
})
export class UserInfrastructureModule {
}
