import { Module } from '@nestjs/common'
import { EmailService } from './email.service'
import { MailjetProvider } from './internal/providers/mailjet/mailjet.provider'
import { NodemailerProvider } from './internal/providers/nodemailer/nodemailer.provider'

@Module({
  imports: [],
  providers: [
    EmailService,
    NodemailerProvider,
    MailjetProvider,
  ],
  exports: [EmailService],
})
export class EmailModule { }
