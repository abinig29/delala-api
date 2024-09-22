
import { Module } from '@nestjs/common';
import { ClassifiedService } from './classified.service';
import { ClassifiedController } from './classified';

@Module({
  providers: [ClassifiedService],
  controllers: [ClassifiedController]
})
export class ClassifiedModule { }
