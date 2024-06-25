import { dotenv } from 'dotenv/config';
import { Test } from '@nestjs/testing';
import { KeysController } from './keys.controller';
import { KeyService } from './keys.service';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import client from '../../lib/redis';

describe('KeysController', () => {
  let app;
  let keys;

  let customerId = '123123'

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

  describe('getKey', () => {
    it('should return empty key', async () => {
      let data = { customerId }
      const keysController = keys.get(KeysController);
      const res = await keysController.getKey(data);
      expect(data).toEqual({ customerId, key: undefined });
    });
  });

  describe('createKey', () => {
    it('should create a key', async () => {
      //expires in 10 minutes
      const expiresAt = new Date().getTime() + 600000;
      let data = { customerId, expiresAt, rateLimit: 100, enabled: 1 }
      const keysController = keys.get(KeysController);
      const res = await keysController.createKey(data);
      expect(res.customerId).toEqual(customerId);
      expect(res.key).toEqual(expect.any(String));
      expect(res.expiresAt).toEqual(expiresAt);
      expect(res.rateLimit).toEqual(100);
      expect(res.enabled).toEqual(1);
    });
  });

  describe('updateKey', () => {
    it('should update a key', async () => {
      const expiresAt = new Date().getTime() + 600000;
      let data = { customerId, expiresAt, rateLimit: 100, enabled: 1 }
      const keysController = keys.get(KeysController);
      const res = await keysController.updateKey(data);
      expect(res.customerId).toEqual(customerId);
      expect(res.expiresAt).toEqual(expiresAt);
      expect(res.key).toEqual(expect.null);
      expect(res.rateLimit).toEqual(100);
      expect(res.enabled).toEqual(1);
    });
  });

  describe('deleteKey', () => {
    it('should delete a key', async () => {
      let data = { customerId }
      const keysController = keys.get(KeysController);
      const res = await keysController.deleteKey(data);
      expect(res).toEqual({ customerId });
    });
  });

  describe('getPlan', () => {
    it('should return plan', async () => {
      //expires in 10 minutes
      const expiresAt = new Date().getTime() + 600000;
      let data = { customerId, expiresAt, rateLimit: 100, enabled: 1 }
      const keysController = keys.get(KeysController);
      const res = await keysController.createKey(data);
      expect(res.customerId).toEqual(customerId);
      expect(res.key).toEqual(expect.any(String));
      expect(res.expiresAt).toEqual(expiresAt);
      expect(res.rateLimit).toEqual(100);
      expect(res.enabled).toEqual(1);

      let key = res.key;
      let planData = { key }
      const planRes = await keysController.getPlan(planData);
      expect(planRes).toHaveProperty('key');
      expect(planRes).toHaveProperty('expiresAt');
      expect(planRes).toHaveProperty('rateLimit');
      expect(planRes).toHaveProperty('enabled');
    });
  });

  
});
