import { Module } from '@nestjs/common';
import { TokensController } from './token.controller';
import { TokenService } from './token.service';
import { KeyService } from '../keys/keys.service';
@Module({
  imports: [],
  controllers: [TokensController],
  providers: [TokenService, KeyService],
})
export class TokensModule {}
