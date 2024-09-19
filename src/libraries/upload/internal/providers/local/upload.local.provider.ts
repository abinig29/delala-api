import { Injectable } from '@nestjs/common'
import {
  UploadPrivateOptions,
  UploadPrivateReturn,
  UploadProvider,
  UploadPublicOptions,
  UploadPublicReturn,
} from '../../../upload.provider'
import { Logger, LoggerService } from '../../../../logger'
import { ConfigurationService } from '@/core/configuration'
import { FileHelper } from '@/common/util/file.helper'

@Injectable()
export class UploadLocalProvider implements UploadProvider {
  static path = '/upload-local'

  private logger: Logger
  private staticServerUrl: string

  private PATH_LOCAL_PUBLIC = './upload-local/public'
  private PATH_LOCAL_PRIVATE = './upload-local/private'

  constructor(
    private loggerService: LoggerService,
    private configurationService: ConfigurationService,
  ) {
    this.logger = this.loggerService.create({ name: 'UploadLocalProvider' })

    this.initialize()
  }

  private initialize() {
    try {
      FileHelper.writeFolder(this.PATH_LOCAL_PUBLIC)
      this.staticServerUrl = `${this.configurationService.getBaseUrl()}`

      this.logger.success(`Upload Local is active`)
    } catch (error) {
      this.logger.error(`Upload Local failed to start: ${error.message}`)
    }
  }

  async uploadPublic({
    file,
  }: UploadPublicOptions): Promise<UploadPublicReturn> {
    const content = file.buffer
    const originalName = file.originalname.replace(/[^\w\.]/gi, '');
    const timestamp = new Date().toISOString().replace(/[:.-]/g, ''); // Generate a timestamp string
    const fileName = `${timestamp}_${originalName}`;
    const path = FileHelper.joinPaths(this.PATH_LOCAL_PUBLIC, fileName)

    FileHelper.writeFile(path, content)

    const url = `${this.staticServerUrl}/${path}`

    return { url }
  }

  async uploadPrivate({
    file,
  }: UploadPrivateOptions): Promise<UploadPrivateReturn> {
    const content = file.buffer

    const fileName = file.originalname.replace(/[^\w\.]/gi, '')

    const path = FileHelper.joinPaths(this.PATH_LOCAL_PRIVATE, fileName)

    FileHelper.writeFile(path, content)

    const url = `${this.staticServerUrl}/${path}`

    return { url }
  }
}
