
import { createClient } from 'redis';

const client = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || '6379'}`
});

client.on('connect', () => {
  // console.log('Connected to Redis');
});

client.on('error', (err) => {
  // console.error('Error connecting to Redis:', err);
});

// await client.connect();
export default client;

async function setKeyValue(key, value) {
  try {
    await client.set(key, value);
  } catch (err) {
    console.error('Error setting key-value pair:', err);
  }
}

async function getKeyValue(key) {
  try {
    const value = await client.get(key);
    return value;
  } catch (err) {
    console.error('Error getting value:', err);
  }
}

async function deleteKeyValue(key) {
  try {
    await client.del(key);

  } catch (err) {
    console.error('Error deleting value:', err);
  }
}
async function setHashKeyAll(key, values = []) {
  try {
    await client.HSET(key, values);
    // await client.hSet(key, ...values);
    // await client.sendCommand(['HSET', key, ...values]);
  } catch (err) {
    console.error('Error setting HashAll value:', err);
  }
}

async function setHashKeyValue(key, field, value) {
  try {
    await client.hSet(key, field, value);
    //console.log(`Set ${key} :  ${field} to ${value}`);
  } catch (err) {
    console.error('Error setting key-field-value :', err);
  }
}

//decrement hash key value
async function decrementHashKeyValue(key, field) {
  try {
    await client.hIncrBy(key, field, -1);
  } catch (err) {
    console.error('Error decrementing HashKeyValue:', err);
  }
}

//increment hash key value
async function incrementHashKeyValue(key, field, value = 1) {
  try {
    await client.hIncrBy(key, field, value);
  } catch (err) {
    console.error('Error incrementing HashKeyValue:', err);
  }
}

async function getHashAll(key) {
  try {
    const value = await client.hGetAll(key);
    return value;
  } catch (err) {
    console.error('Error getting HashAll value:', err);
  }
}

async function getHashKeyValue(key, field) {
  try {
    const value = await client.hGet(key, field);
    //console.log(`Value for ${key}: ${value}`);
    return value;
  } catch (err) {
    console.error('Error getting HashAll value:', err);
  }
}

async function deletetHashKeyValue(key, field) {
  try {
    await client.hDel(key, field);
  } catch (err) {
    console.error('Error deleting HashKeyValue:', err);
  }
}

export { setKeyValue, getKeyValue, incrementHashKeyValue, decrementHashKeyValue, deleteKeyValue, setHashKeyValue, getHashAll, getHashKeyValue, deletetHashKeyValue, setHashKeyAll };