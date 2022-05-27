import { Connection, createConnection, getConnectionManager } from 'typeorm';

import config from './config/ormconfig';

export const dbCreateConnection = async (): Promise<Connection | null> => {
  try {
    const conn = await createConnection(config);
    console.log('Connected to database');
    return conn;
  } catch (err) {
    if (err.name === 'AlreadyHasActiveConnectionError') {
      const activeConnection = getConnectionManager().get(config.name);
      return activeConnection;
    }
    console.log(err);
  }
  return null;
};
