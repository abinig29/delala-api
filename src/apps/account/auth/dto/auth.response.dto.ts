import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserDto } from '../../user/dto/user.dto';




export class AuthToken {
  @ApiProperty({
    description: 'The access token for the user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken?: string;

  @ApiProperty({
    description: 'The refresh token for the user',
    example: 'd2FsdGVyOi8vYXV0aG9yaXphdGlvbi8zNjg5...'
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'The session ID for the user',
    example: 'session-id-1234'
  })
  sessionId?: string;

  @ApiProperty({
    description: 'The token expiration time in seconds',
    example: 3600
  })
  expiresIn?: number;
}

export class AuthTokenResponse {
  @ApiProperty({ type: AuthToken })
  authToken?: AuthToken;

  @ApiProperty({ type: UserDto })
  userData?: Partial<User>;
}

export class TokenResponse {
  token?: string;
}
