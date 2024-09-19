import { Injectable } from '@nestjs/common'
import * as NodemailerSDK from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { ConfigurationService } from '../../../../../core/configuration'
import { Logger, LoggerService } from '../../../../logger'
import { EmailSender } from '../../email.type'
import { Provider, SendOptions } from '../provider'
import path from 'path'
import ejs from 'ejs' 

@Injectable()
export class NodemailerProvider implements Provider {
  private logger: Logger
  private client: Mail

  constructor(
    private loggerService: LoggerService,
    private configurationService: ConfigurationService,
  ) {
    this.logger = this.loggerService.create({ name: 'NodemailerProvider' })
    this.initialize()
  }

  private initialize() {
    try {
      const host = this.configurationService.get('SMTP_HOST') ?? 'smtp.gmail.com'
      const port = this.configurationService.getNumber('SMTP_PORT')
      const service = this.configurationService.get('SMTP_SERVICE')
      const mail = this.configurationService.get('SMTP_MAIL')
      const password = this.configurationService.get('SMTP_PASSWORD')
      this.client = NodemailerSDK.createTransport({
        host,
        port,
        service,
        secure: port === 465,
        auth: {
          user: mail,
          pass: password,
        },
      })

      this.logger.success(`Nodemailer is active (${host}:${port})`)
    } catch (error) {
      this.logger.error(`Nodemailer failed to start: ${error.message}`)
    }
  }

  async send(options: SendOptions): Promise<void> {
    const from = EmailSender.default

    for (const to of options.to) {
      try {
        // Define the template path and data
        const templatePath = path.join(__dirname, './templates/', `${options?.type}.ejs`)
        const data = options.variables
        const html = await ejs.renderFile(templatePath, data)

        const mailOptions = {
          from: `${from.name} <${from.email}>`,
          to: to.email,
          subject: options.subject,
          html,
        }
        await this.client.sendMail(mailOptions)
        this.logger.log(`Emails sent to EMAIL: ${to.email}`)
      } catch (error) {
        this.logger.error(`Could not send emails: ${error.message}`)
      }
    }
  }
}
