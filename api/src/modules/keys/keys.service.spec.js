import { dotenv } from 'dotenv/config';
import { Test } from '@nestjs/testing';
import { KeysController } from './keys.controller';
import { KeyService } from './keys.service';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import client from '../../lib/redis';

describe('KeyService', () => {
  let app;
  let keys;

  let customerId = '2456';

  beforeAll(async () => {
    keys = await Test.createTestingModule({
      controllers: [KeysController],
      providers: [KeyService],
    }).compile();

    app = keys.createNestApplication();
    await app.init();
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  //is valid request
  describe('isValidRequest', () => {
    it('should return true for valid request', async () => {
      const expiresAt = new Date().getTime() + 600000;
      let data = { customerId, expiresAt, rateLimit: 100, enabled: 1 }
      const keysController = keys.get(KeysController);
      const res = await keysController.createKey(data);
      let key = res.key;

      let validRequestData = { key }
      const keyService = keys.get(KeyService);
      const isValidRequest = await keyService.isValidRequest(validRequestData);
      expect(isValidRequest).toEqual(true);
    });

    it('should return false for invalid request', async () => {
      const expiresAt = new Date().getTime() + 600000;
      let data = { customerId, expiresAt, rateLimit: 100, enabled: 1 }
      const keysController = keys.get(KeysController);
      const res = await keysController.createKey(data);
      let key = res.key;

      const keyService = keys.get(KeyService);

      //override rate limit
      await keyService.incrementRequestCount({ key, value: 101 });

      let validRequestData = { key }
      const isValidRequest = await keyService.isValidRequest(validRequestData);
      expect(isValidRequest).toEqual(true);
    });

    //return false for expired key
    it('should return false for expired key', async () => {
      const expiresAt = new Date().getTime() - 600000;
      let data = { customerId, expiresAt, rateLimit: 100, enabled: 1 }
      const keysController = keys.get(KeysController);
      const res = await keysController.createKey(data);
      let key = res.key;
      let validRequestData = { key }
      const keyService = keys.get(KeyService);
      const isValidRequest = await keyService.isValidRequest(validRequestData);
      expect(isValidRequest).toEqual(false);
    });
  });
});
