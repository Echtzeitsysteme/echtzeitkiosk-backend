import { agent as request } from 'supertest';
import { getRepository, Connection, Repository } from 'typeorm';

import { app } from '../../src';
import { config } from '../../src/config/config';
import { setupTestDBforSystemTest } from '../utils/setupTestDBforSystemTest';

// import { Role } from 'orm/entities/users/types';
// import { User } from 'orm/entities/users/User';

(async () => {
  await setupTestDBforSystemTest();
})();

const testSuiteState = {};

describe('System test', function () {
  let superuser;

  test('SUPERUSER: should return the logged in superuser', async () => {
    expect(true).toBe(true);
  });
});
