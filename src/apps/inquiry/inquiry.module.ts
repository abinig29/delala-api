import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry';
import { InquiryException } from './inquiry.exception';

@Module({
  providers: [InquiryService, InquiryException],
  controllers: [InquiryController]
})
export class InquiryModule { }
