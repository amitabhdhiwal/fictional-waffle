
import { Injectable, Dependencies } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles';

@Injectable()
@Dependencies(Reflector)
export class RolesGuard {
  constructor(reflector) {
    this.reflector = reflector;
  }

  canActivate(context) {
    const requiredRoles = this.reflector.get(ROLES_KEY, context.getHandler());
    const request = context.switchToRpc().getData();

    console.log({requiredRoles, request});
    if (!requiredRoles) {
      return false;
    }
    const user = request.user;
    if(!user.role) {
      return false;
    }
    let allowed = requiredRoles.includes(user.role);
    return allowed;
  }
}
