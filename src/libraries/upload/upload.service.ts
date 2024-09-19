import { Injectable } from '@nestjs/common'
import { LoggerService } from '../logger'
import { UploadLocalProvider } from './internal/providers/local/upload.local.provider'
import { UploadProvider } from './upload.provider'
import { UploadFileType } from './upload.type'
import { ConfigurationService } from '@/core/configuration'
import { CloudinaryService } from './internal/providers/cloudinary/cloudinary'

@Injectable()
export class UploadService {
  private instance: UploadProvider

  constructor(
    private configurationService: ConfigurationService,
    private loggerService: LoggerService,
  ) {
    this.instance = this.createInstance()
  }

  private isMocked(): boolean {
    const isDevelopment = this.configurationService.isEnvironmentDevelopment()
    return isDevelopment
  }

  private createInstance(): UploadProvider {
    if (this.isMocked()) {
      return new UploadLocalProvider(
        this.loggerService,
        this.configurationService,
      )
    } else {
      return new CloudinaryService(this.configurationService)
    }
  }

  async uploadPublic(file: UploadFileType): Promise<{ url: string }> {
    const response = await this.instance.uploadPublic({ file })
    return response
  }

  // async uploadPrivate(...files: UploadFileType[]): Promise<{ url: string }[]> {
  //   const responses = []

  //   for (const file of files) {
  //     const response = await this.instance.uploadPrivate({ file })

  //     responses.push(response)
  //   }

  //   return responses
  // }
}
