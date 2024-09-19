import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ConfigurationService } from '../../../../../core/configuration'
import { EmailService } from '../../../../../libraries/email'
import { AuthenticationApplicationEvent } from '../../auth.event'
import { UserService } from '../../../user/user.service'

@Injectable()
export class AuthenticationCommunicationSubscriber {
  constructor(
    private configurationService: ConfigurationService,
    private emailService: EmailService,
    private userService: UserService
  ) { }

  // TODO rename the subject and email type

  @OnEvent(AuthenticationApplicationEvent.UserRegistered.key)
  async handleUserRegistered(data: { userId: string }) {
    const user = await this.userService.findOneByIdOrFail(data.userId)
    const type = this.emailService.Type.AUTHENTICATION_WELCOME


    // await this.emailService.send({
    //   type,
    //   email: user?.email,
    //   name: user?.fullName ?? user?.email,
    //   subject: `Welcome`,
    //   variables: {},
    // })
  }

  @OnEvent(AuthenticationApplicationEvent.UserPasswordResetRequested.key)
  async handleResetPassword(data: { userId: string, code: string }) {
    const user = await this.userService.findOneByIdOrFail(data?.userId)
    const url = this.configurationService.getClientBaseUrl()
    const urlResetPassword = `${url}/reset-password/${data?.code}`
    const type = this.emailService.Type.AUTHENTICATION_FORGOT_PASSWORD
    // await this.emailService.send({
    //   type,
    //   email: user.email,
    //   name: user.fullName ?? user.email,
    //   subject: `Reset your password`,
    //   variables: {
    //     url_password_reset: urlResetPassword,
    //   },
    // })
  }
}
