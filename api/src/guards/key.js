
import { Injectable, Dependencies, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KeyService } from '../modules/keys/keys.service';

@Injectable()
@Dependencies(Reflector, KeyService)
export class KeyGuard {

  logger = new Logger('KeyGuard');

  constructor(reflector, keyService) {
    this.reflector = reflector;
    this.keyService = keyService;
  }

  async canActivate(context) {
    const request = context.switchToRpc().getData();
    let isValidKey = await this.keyService.isValidRequest(request)
    request.meta = { isValidKey }
    this.logger.log({key: request.key, timestamp: Date.now(), ...isValidKey, status: isValidKey.rateLimited ? "rateLimted" : "success"})
    return isValidKey.valid;
  }
}
