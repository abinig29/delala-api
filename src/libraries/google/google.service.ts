import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigurationService } from '../../core/configuration';
import { Logger, LoggerService } from '../logger';
import { GoogleVerify } from './google.interface';

@Injectable()
export class GoogleService {
  private logger: Logger;
  private clientId: string;
  private clientSecret: string;

  constructor(
    private configurationService: ConfigurationService,
    private loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.create({ name: 'GoogleService' });

    try {
      this.clientId = this.configurationService.get('SERVER_GOOGLE_CLIENT_ID');
      this.clientSecret = this.configurationService.get('SERVER_GOOGLE_CLIENT_SECRET');

      if (!this.clientId || !this.clientSecret) {
        this.logger.warn('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env to activate Google Auth');
        return;
      }
      this.logger.success('Google OAuth active');
    } catch (error) {
      this.logger.error('Could not start Google OAuth');
      this.logger.error(error);
    }
  }


  async getToken(code: string): Promise<any> {
    console.log({ code })

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: 'YOUR_REDIRECT_URI', // Replace this with your actual redirect URI
        grant_type: 'authorization_code',
      });

      const { access_token, id_token } = response.data;
      console.log({ id_token })
      this.logger.success('Token retrieved successfully');
      return { access_token, id_token };
    } catch (error) {
      console.log({
        error: error?.response
      })
      throw error;
    }
  }


  async verifyToken(token: string): Promise<GoogleVerify> {
    try {
      const { id_token } = await this.getToken(token)
      console.log(id_token, "what")
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
      const { name, email } = response.data;
      this.logger.success('ID token verified successfully');
      return { name, email };
    } catch (error) {
      console.log({
        error: error?.response
      })
      throw error;
    }
  }
}
