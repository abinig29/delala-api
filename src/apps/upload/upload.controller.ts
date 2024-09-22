import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadFileType, UploadService } from '@/libraries/upload'

@Controller('/upload')
export class UploadController {
  constructor(private uploadService: UploadService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: UploadFileType) {
    const response = await this.uploadService.uploadPublic(file)
    const url = response.url.replace(/\\/g, '/')
    return { url }
  }
}
