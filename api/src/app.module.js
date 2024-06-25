import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

//import keys module
import { KeysModule } from './modules/keys/keys.module';

//import tokens module
import { TokensModule } from './modules/token/token.module';

@Module({
  imports: [
    KeysModule, TokensModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
