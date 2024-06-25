import { Injectable, Dependencies } from '@nestjs/common';
import { setHashKeyAll, getHashAll, incrementHashKeyValue, getHashKeyValue, deleteKeyValue, setKeyValue, getKeyValue, setHashKeyValue } from '../../lib/redis';
import short from 'short-uuid';


@Injectable()
export class KeyService {

  getHashKey(customerId) {
    let hashKeyPrefix = "key:";
    let hashKey = hashKeyPrefix + customerId;
    return hashKey;
  }

  //get key
  async getKey(data) {
    const { customerId } = data;
    let hashKey = this.getHashKey(customerId)
    let key = await getHashKeyValue(hashKey, 'key');
    return { customerId, key };
  }

  //create key
  async createKey(data) {
    const { customerId, expiresAt, rateLimit, enabled } = data;
    let hashKey = this.getHashKey(customerId)
    let key = short.generate();
    let hash = ['key', key, 'req_c', 0];
    if (expiresAt) {
      hash.push('expiresAt', expiresAt);
    }
    if (rateLimit) {
      hash.push('rateLimit', rateLimit);
    }
    if (enabled !== undefined) {
      hash.push('enabled', enabled);
    }
    await setHashKeyAll(hashKey, hash);

    //save reference to key:customerId
    await setKeyValue(key, hashKey);

    return { customerId, key: key, expiresAt, rateLimit, enabled };
  }

  //delete key
  async deleteKey(data) {
    const { customerId } = data;
    let hashKey = this.getHashKey(customerId)
    await deleteKeyValue(hashKey);
    return { customerId };
  }

  //update key
  async updateKey(data) {
    const { customerId, expiresAt, rateLimit, enabled } = data;
    let hashKey = this.getHashKey(customerId)
    let hash = [];
    if (expiresAt) {
      hash.push('expiresAt', expiresAt);
    }
    if (rateLimit) {
      hash.push('rateLimit', rateLimit);
    }
    if (enabled !== undefined) {
      hash.push('enabled', enabled);
    }
    if (hash.length === 0) return { customerId };
    await setHashKeyAll(hashKey, hash);
    return { customerId, expiresAt, rateLimit, enabled };
  }

  //get plan
  async getPlan(data) {
    const { key } = data;
    let hashKey = await getKeyValue(key);
    if (!hashKey) return false;

    let hash = await getHashAll(hashKey);

    return hash;
  }

  //disable key
  async disableKey(data) {
    const { key, customerId } = data;
    let hashKey = this.getHashKey(customerId)
    await setHashKeyValue(hashKey, 'enabled', 0);
    return { customerId, key };
  }

  async getKeyValue(data, field) {
    const { key } = data;
    let customerId = await getKeyValue(key);
    let value = await getHashKeyValue(customerId, field);
    return value;
  }

  //set key value
  async setKeyValue(data, field, value) {
    const { key } = data;
    let customerId = await getKeyValue(key);
    let hashKey = this.getHashKey(customerId)
    await setHashKeyValue(hashKey, field, value);
  }

  //check if key is enabled
  async isEnabled(data) {
    let value = await this.getKeyValue(data, 'enabled')
    return parseInt(value) === 1;
  }

  planIsEnabled(plan) {
    return plan.enabled !== undefined && parseInt(plan.enabled) === 1;
  }

  //check if key has expired
  async hasExpired(data) {
    let expiresAt = await this.getKeyValue(data, 'expiresAt');
    return expiresAt < Date.now();
  }

  planHasExpired(plan) {
    return plan.expiresAt && plan.expiresAt < Date.now();
  }
  
  //check if key has exceeded rate limit
  async hasExceededRateLimit(data) {
    let rateLimit = await this.getKeyValue(data, 'rateLimit')
    //get current request count
    let customerId = await getKeyValue(data.key);
    let hashKey = this.getHashKey(customerId)
    let reqCount = await getHashKeyValue(hashKey, 'req_c');
    if (!reqCount) reqCount = 0;
    reqCount = parseInt(reqCount);
    rateLimit = parseInt(rateLimit)
    //check if request count has exceeded rate limit
    return reqCount >= rateLimit;
  }

  //increment request count
  async incrementRequestCount(data) {
    const { key } = data;
    let { value } = data;
    if (!value) value = 1;
    let customerId = await getKeyValue(key);
    let hashKey = this.getHashKey(customerId)
    await incrementHashKeyValue(hashKey, 'req_c', value);
  }

  //set last request time
  async setLastRequestTime(data) {
    const { key } = data;
    let customerId = await getKeyValue(key);
    let hashKey = this.getHashKey(customerId)
    await setHashKeyValue(hashKey, 'last_req', Date.now());
  }

  async isValidRequest(data) {
    let res = { valid: false }
    if (!data.key) {
      res.noKey = true;
      return res;
    }

    let plan = await this.getPlan(data);
    if (!plan) {
      res.noPlan = true;
      return res
    };

    let isEnabled = this.planIsEnabled(plan)
    if (!isEnabled) {
      res.disabled = true;
      return res
    };

    let hasExpired = this.planHasExpired(plan);
    if (hasExpired) {
      res.hasExpired = true;
      return res
    };

    let hasExceededRateLimit = await this.hasExceededRateLimit(plan);
    if (hasExceededRateLimit) {
      res.rateLimited = true;
      return res
    };


    //if current second is 0 reset request count
    let now = new Date();
    let seconds = now.getSeconds();

    //if 60 seconds have passed since last request reset request count
    let lastRequestTime = await this.getKeyValue(data, 'last_req');
    let timeDiff = now - lastRequestTime;
    let shouldResetCount = (seconds === 0 || timeDiff > 60000);

    if (shouldResetCount) {
      await this.setKeyValue(data, 'req_c', 0);
    }

    await this.incrementRequestCount(data);
    await this.setLastRequestTime(data);

    res.valid = true;
    return res;
  }
}
