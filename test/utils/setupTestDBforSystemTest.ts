import { exec, execSync } from 'child_process';

import { dbCreateConnection } from '../../src/orm/dbCreateConnection';
import { closeDBConnection } from '../../src/utils/dbCloseConnection';
import { dbCreateConnectionAndCreateDefaultTablesWithDefaultValuesIfNotExists } from '../../src/utils/dbCreateConnectionAndCreateDefaultTablesWithDefaultValuesIfNotExists';
import { logger } from '../../src/utils/logger';

async function dropAllTables() {
  const connection = await dbCreateConnection();
  const entities = connection?.entityMetadatas;

  if (entities) {
    for (const entity of entities) {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    }
  }
}

export const setupTestDBforSystemTest = async () => {
  beforeAll(async () => {
    try {
      console.log('process.env.NODE_ENV', process.env.NODE_ENV);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second ?? xd
    } catch (error) {
      logger.error(error);
    }
  });

  afterAll(async () => {
    try {
      await dropAllTables();
      await new Promise((resolve) => setTimeout(resolve, 500));

      await closeDBConnection();
      await new Promise((resolve) => setTimeout(resolve, 500));

      execSync(
        'docker stop postgres_test && docker stop adminer_test && docker rm --force --volumes adminer_test && docker rm --force --volumes postgres_test',
        {
          stdio: 'inherit',
        },
      );
    } catch (error) {
      logger.error(error);
    }
  });
};
