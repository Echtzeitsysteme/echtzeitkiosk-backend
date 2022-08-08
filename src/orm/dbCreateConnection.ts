import { Connection, createConnection, getConnectionManager } from 'typeorm';

import ormConfig from '../orm/config/ormconfig';

export const dbCreateConnection = async (): Promise<Connection | null> => {
  try {
    const conn = await createConnection(ormConfig);

    if (!conn.isConnected) {
      await conn.connect();
    }

    console.log('Connected to database');
    return conn;
  } catch (err) {
    if (err.name === 'AlreadyHasActiveConnectionError') {
      const activeConnection = getConnectionManager().get(ormConfig.name);
      return activeConnection;
    }
    console.log(err);
  }
  return null;
};
