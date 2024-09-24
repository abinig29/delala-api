import { ConfigurationService } from '@/core/configuration';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigurationService) {
        console.log({ redirect: `${configService.get("SERVER_BASE_URL")}/api/auth/google/callback` })
        super({
            clientID: configService.get('SERVER_GOOGLE_CLIENT_ID'),
            clientSecret: configService.get('SERVER_GOOGLE_CLIENT_SECRET'),
            callbackURL: `${configService.get("SERVER_BASE_URL")}/api/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };
        done(null, user);
    }
}
