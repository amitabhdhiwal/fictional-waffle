import { Controller, Dependencies, Get, UseGuards } from '@nestjs/common';
import { KeyService } from './keys.service';
import { MessagePattern } from '@nestjs/microservices';
import { RolesGuard } from '../../guards/roles';
import { Roles } from '../../decorators/roles';

@Controller('keys')
@Dependencies(KeyService)
@UseGuards(RolesGuard)  
export class KeysController {
  constructor(keyService) {
    this.keyService = keyService;
  }

  //get key
  @MessagePattern({ cmd: 'get-key' })
  @Roles('admin')
  async getKey(data) {
    return this.keyService.getKey(data);
  }

  //create key
  @MessagePattern({ cmd: 'create-key' })
  @Roles('admin')
  async createKey(data) {
    return this.keyService.createKey(data);
  }

  //update key
  @MessagePattern({ cmd: 'update-key' })
  @Roles('admin')
  async updateKey(data) {
    return this.keyService.updateKey(data);
  }

  //delete key
  @MessagePattern({ cmd: 'delete-key' })
  @Roles('admin')
  async deleteKey(data) {
    return this.keyService.deleteKey(data);
  }

  @MessagePattern({ cmd: 'get-plan' })
  @Roles('customer')
  async getPlan(data) {
    return this.keyService.getPlan(data);
  }

  //disable key
  @MessagePattern({ cmd: 'disable-key' })
  @Roles('admin')
  async disableKey(data) {
    return this.keyService.disableKey(data);
  }
}
