
import { Injectable, Dependencies } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KeyService } from '../modules/keys/keys.service';

@Injectable()
@Dependencies(Reflector, KeyService)
export class KeyGuard {
  constructor(reflector, keyService) {
    this.reflector = reflector;
    this.keyService = keyService;
  }

  async canActivate(context) {
    const request = context.switchToRpc().getData();
    let isValidKey = await this.keyService.isValidRequest(request)
    return isValidKey;
  }
}
