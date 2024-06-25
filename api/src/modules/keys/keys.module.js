import { Module } from '@nestjs/common';
import { KeysController } from './keys.controller';
import { KeyService } from './keys.service';

@Module({
  imports: [
  ],
  controllers: [KeysController],
  providers: [KeyService],
})
export class KeysModule {}
