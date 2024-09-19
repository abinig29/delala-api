import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UserModule } from '../user/user.module';
import { GuardsModule } from '@/core/guard/guards.module';
import { CryptoModule } from '@/core/crypto';



@Module({
  imports: [
    UserModule,
    GuardsModule,
    CryptoModule
  ],
  controllers: [ProfileController],
})
export class ProfileModule { }
