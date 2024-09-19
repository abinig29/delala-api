import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { UploadService } from './upload.service'
import { FileHelper } from '@/common/util/file.helper'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(FileHelper.getRoot(), './upload-local'),
      serveRoot: '/upload-local',
    }),
  ],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule { }
