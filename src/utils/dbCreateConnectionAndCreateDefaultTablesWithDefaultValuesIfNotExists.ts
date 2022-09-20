import { Connection } from 'typeorm';

import { createSuperuserIfnotExists, createSystemStateTableIfNotExists } from '../helpers/users/superuserHelpers';
import { dbCreateConnection } from '../orm/dbCreateConnection';

export const dbCreateConnectionAndCreateDefaultTablesWithDefaultValuesIfNotExists =
  async (): Promise<Connection | null> => {
    const connection = await dbCreateConnection();
    await createSystemStateTableIfNotExists();
    await createSuperuserIfnotExists();

    // if no connection is established, try again in 10 seconds
    if (!connection) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return dbCreateConnectionAndCreateDefaultTablesWithDefaultValuesIfNotExists();
    }

    return connection;
  };
