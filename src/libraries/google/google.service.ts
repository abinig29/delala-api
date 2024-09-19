import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { ConfigurationService } from '../../core/configuration'
import { Logger, LoggerService } from '../logger'
import { GoogleVerify } from './google.interface'

@Injectable()
export class GoogleService {
  private logger: Logger

  client: OAuth2Client

  private clientId: string

  constructor(
    private configurationService: ConfigurationService,
    private loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.create({ name: 'GoogleService' })

    try {
      this.clientId = this.configurationService.get('SERVER_GOOGLE_CLIENT_ID')
      if (!this.clientId) {
        this.logger.warn(
          `Set GOOGLE_CLIENT_ID in your .env to activate Google Auth`,
        )
        return
      }
      this.client = new OAuth2Client(this.clientId)
      this.logger.success(`Google Oauth active`)
    } catch (error) {
      this.logger.error(`Could not start Google Oauth`)
      this.logger.error(error)
    }
  }

  async verifyToken(token: string): Promise<GoogleVerify> {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: this.clientId,
    })
    const { name, email } = ticket.getPayload()
    return {
      name,
      email,
    }
  }
}
