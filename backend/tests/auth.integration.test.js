import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnv } from './helpers.js';

setupTestEnv();

test('registerUser hashes password and returns auth payload', async () => {
  const { registerUser } = await import('../services/authService.js');
  const { User } = await import('../models/User.js');

  const originalFindOne = User.findOne;
  const originalCreate = User.create;

  User.findOne = async () => null;
  let capturedPasswordHash = null;
  User.create = async ({ email, passwordHash, name }) => {
    capturedPasswordHash = passwordHash;
    return {
      _id: '507f1f77bcf86cd799439011',
      email,
      passwordHash,
      name,
    };
  };

  const result = await registerUser({
    email: 'test@example.com',
    password: 'SuperSecret123',
    name: 'Test User',
  });

  assert.equal(result.user.email, 'test@example.com');
  assert.equal(result.user.name, 'Test User');
  assert.ok(result.token);

  assert.ok(capturedPasswordHash);
  assert.notEqual(capturedPasswordHash, 'SuperSecret123');

  User.findOne = originalFindOne;
  User.create = originalCreate;
});

after(async () => {
  const { redis } = await import('../cache/redisClient.js');
  redis.disconnect();
});
