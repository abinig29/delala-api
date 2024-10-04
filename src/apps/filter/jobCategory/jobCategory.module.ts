
import { Module } from '@nestjs/common';
import { JobCategoryService } from './jobCategory.service';
import { JobCategoryController } from './jobCategory';

@Module({
  providers: [JobCategoryService],
  controllers: [JobCategoryController]
})
export class JobCategoryModule { }
