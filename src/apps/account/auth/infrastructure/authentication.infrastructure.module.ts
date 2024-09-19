import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { UserModule } from '../../user/user.module'
import { EmailModule } from 'src/libraries/email'
import { AuthenticationCommunicationSubscriber } from './subscribers/authentication.communication.subscriber'

@Global()
@Module({
  imports: [
    UserModule,
    EmailModule],
  providers: [
    AuthenticationCommunicationSubscriber,
  ],
})
export class AuthenticationInfrastructureModule {
}
