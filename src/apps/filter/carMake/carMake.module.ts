
import { Module } from '@nestjs/common';
import { CarMakeService } from './carMake.service';
import { CarMakeController } from './carMake';

@Module({
  providers: [CarMakeService],
  controllers: [CarMakeController]
})
export class CarMakeModule { }
