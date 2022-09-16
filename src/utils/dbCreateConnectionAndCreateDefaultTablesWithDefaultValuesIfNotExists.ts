import { Connection } from 'typeorm';

import { createSuperuserIfnotExists, createSystemStateTableIfNotExists } from '../helpers/users/superuserHelpers';
import { dbCreateConnection } from '../orm/dbCreateConnection';

export const dbCreateConnectionAndCreateDefaultTablesWithDefaultValuesIfNotExists =
  async (): Promise<Connection | null> => {
    const connection = await dbCreateConnection();
    await createSystemStateTableIfNotExists();
    await createSuperuserIfnotExists();

    return connection;
  };
