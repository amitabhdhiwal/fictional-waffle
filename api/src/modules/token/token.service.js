import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {

  //get token
  async getToken(data) {
    return {
      token: "token " + new Date()
    }
  }
}
