import { Injectable } from '@nestjs/common'
import Mailjet from 'node-mailjet'
import { Logger, LoggerService, ConfigurationService } from '../../../dependencies'
import { EmailSender, EmailType } from '../../email.type'
import { Provider, SendOptions } from '../provider'
import path from 'path'
import * as hbs from 'nodemailer-express-handlebars'
import * as Handlebars from 'handlebars'

@Injectable()
export class MailjetProvider implements Provider {
  private logger: Logger
  private client: Mailjet
  private hbsOptions: any

  constructor(
    private loggerService: LoggerService,
    private configurationService: ConfigurationService,
  ) {
    this.logger = this.loggerService.create({ name: 'MailjetProvider' })
    this.initialize()
  }

  private initialize() {
    const isDevelopment = this.configurationService.isEnvironmentDevelopment()

    if (isDevelopment) {
      this.logger.warn(`Mailjet is disabled in development`)
      return
    }

    try {
      const apiKey = this.configurationService.get('SERVER_EMAIL_MAILJET_API_KEY')
      const secretKey = this.configurationService.get('SERVER_EMAIL_MAILJET_SECRET_KEY')

      if (!apiKey || !secretKey) {
        this.logger.warn(`Set EMAIL_MAILJET_API_KEY and EMAIL_MAILJET_SECRET_KEY to activate Mailjet`)
        return
      }

      this.client = new Mailjet({ apiKey, apiSecret: secretKey })
      this.logger.success(`Mailjet service active`)

      // Handlebars view engine options
      this.hbsOptions = {
        viewEngine: {
          extName: '.hbs',
          partialsDir: path.join(__dirname, './templates/'),
          layoutsDir: path.join(__dirname, './templates/'),
          defaultLayout: '',
        },
        viewPath: path.join(__dirname, './templates/'),
      }

    } catch (error) {
      this.logger.error(`Could not start Mailjet service`)
      this.logger.error(error)
    }
  }

  async send(options: SendOptions): Promise<void> {
    const from = {
      Email: EmailSender.default.email,
      Name: EmailSender.default.name,
    }
    const to = options.to.map(item => ({ Email: item.email, Name: item.name }))

    for (const recipient of to) {
      const message = {
        From: from,
        To: [recipient],
        Subject: options.subject,
        HTMLPart: await this.renderTemplate(options.type, options.variables),
      }

      await this.client
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [message],
        })
        .then(result => {
          this.logger.log(`Emails sent to ${recipient.Email}`)
        })
        .catch(error => {
          this.logger.error(`Could not send emails (${error.statusCode})`)
          this.logger.error(error)
        })
    }
  }

  // Helper function to render Handlebars templates
  private async renderTemplate(templateName: EmailType, variables: Record<string, any>): Promise<string> {
    const templatePath = path.join(this.hbsOptions.viewPath, `${templateName}.hbs`)
    const templateContent = await this.loadTemplate(templatePath)
    const template = Handlebars.compile(templateContent)
    return template(variables)
  }

  // Function to load the template from the file system
  private async loadTemplate(templatePath: string): Promise<string> {
    const fs = await import('fs').then(module => module.promises)
    try {
      return await fs.readFile(templatePath, 'utf8')
    } catch (error) {
      this.logger.error(`Failed to load template: ${templatePath}`)
      throw error
    }
  }
}
