import { Controller, Dependencies, Get, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { MessagePattern } from '@nestjs/microservices';
import { RolesGuard } from '../../guards/roles';
import { Roles } from '../../decorators/roles';
import { KeyGuard } from '../../guards/key';

@Controller('tokens')
@Dependencies(TokenService)
@UseGuards(RolesGuard, KeyGuard)  
export class TokensController {
  constructor(tokenService) {
    this.tokenService = tokenService;
  }

  //get token
  @MessagePattern({ cmd: 'get-token' })
  @Roles('customer')
  async getToken(data) {
    return this.tokenService.getToken(data);
  }

  // //create token
  // @MessagePattern({ cmd: 'create-token' })
  // @Roles('customer')
  // async createToken(data) {
  //   return this.tokenService.createToken(data);
  // }

  // //update token
  // @MessagePattern({ cmd: 'update-token' })
  // @Roles('customer')
  // async updateToken(data) {
  //   return this.tokenService.updateToken(data);
  // }

  // //delete token
  // @MessagePattern({ cmd: 'delete-token' })
  // @Roles('customer')
  // async deleteToken(data) {
  //   return this.tokenService.deleteToken(data);
  // }
}
