import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ConfigurationService } from '../../../../../core/configuration'
import { EmailService } from '../../../../../libraries/email'
import { UserApplicationEvent } from '../../user.event'
import { UserService } from '../../user.service'

@Injectable()
export class UserCommunicationSubscriber {
  constructor(
    private configurationService: ConfigurationService,
    private emailService: EmailService,
    private userService: UserService
  ) { }

  // TODO rename the subject and email type

  @OnEvent(UserApplicationEvent.AdminRegistered.key)
  async handleUserRegistered(data: { userId: string }) {
    const user = await this.userService.findOneByIdOrFail(data.userId)
    // const type = this.emailService.Type.AUTHENTICATION_FORGOT_PASSWORD
    // await this.emailService.send({
    //   type,
    //   email: user?.email,
    //   name: user?.fullName ?? user?.email,
    //   subject: `Welcome`,
    //   variables: {},
    // })
  }


}
