import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigurationService } from '../../core/configuration';
import { Logger, LoggerService } from '../logger';
import { GoogleVerify } from './google.interface';
import axios from 'axios';

@Injectable()
export class GoogleService {
  private logger: Logger;
  private clientId: string;
  private clientSecret: string;
  private oauth2Client: OAuth2Client;

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

      this.oauth2Client = new OAuth2Client(
        this.clientId,
        this.clientSecret,
        'http://localhost:5000/api/auth/google/callback' // Redirect URI
      );

      this.logger.success('Google OAuth active');
    } catch (error) {
      this.logger.error('Could not start Google OAuth');
      this.logger.error(error);
    }
  }

  async getToken(code: string): Promise<any> {
    console.log({ code });

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.logger.success('Token retrieved successfully');
      return tokens; // contains access_token and id_token
    } catch (error) {
      console.log({
        error,
      });
      this.logger.error('Error retrieving token');
      throw error;
    }
  }

  async verifyToken(idToken: string): Promise<GoogleVerify> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: this.clientId, // Specify the CLIENT_ID of the app that accesses the backend
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      const { name, email } = payload;
      this.logger.success('ID token verified successfully');
      return { name, email };
    } catch (error) {
      console.log({
        error: error?.response?.data,
      });
      this.logger.error('Error verifying token');
      throw error;
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { email, name, picture } = response.data;
      return { returnEmail: email };
    } catch (error) {
      console.error('Error fetching user info', error);
      throw error;
    }
  }
}
