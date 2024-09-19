import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigurationService } from '@/core/configuration';
import { UploadPublicOptions, UploadPublicReturn } from '@/libraries/upload/upload.provider';

@Injectable()
export class CloudinaryService {
  constructor(private configurationService: ConfigurationService) {
    this.initializeCloudinary();
  }

  private initializeCloudinary() {
    const cloudName = this.configurationService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configurationService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configurationService.get('CLOUDINARY_API_SECRET');


    console.log({
      apiSecret,
      apiKey,
      cloudName
    })

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  public async upload(file: string | Buffer, folder: string): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'auto',
            folder: folder,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve({
              url: result.url,
            });
          },
        )
        .end(file);
    });
  }

  public async uploadPublic(file: UploadPublicOptions): Promise<UploadPublicReturn> {
    const uploader = async (fileBuffer: Buffer) => await this.upload(fileBuffer, 'Images');

    try {
      const { buffer } = file.file;
      const uploadedFile = await uploader(buffer);
      return uploadedFile;
    } catch (error) {
      console.log({ error })
      throw error;
    }
  }
}
