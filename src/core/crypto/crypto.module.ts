import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CustomJwtService } from './jwt.service';
import { ConfigurationModule } from '../configuration';

@Module({
  imports: [ConfigurationModule],
  providers: [CryptoService, CustomJwtService],
  exports: [CryptoService, CustomJwtService],
})
export class CryptoModule { }
