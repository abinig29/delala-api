import { Module, Global } from '@nestjs/common';
import { JwtGuard } from './guard.rest';
import { CryptoModule } from '../crypto/crypto.module';
import { GuardException } from './guard.exception';

@Global()
@Module({
  imports: [CryptoModule],
  providers: [JwtGuard, GuardException],
  exports: [JwtGuard, CryptoModule, GuardException],
})
export class GuardsModule { }
