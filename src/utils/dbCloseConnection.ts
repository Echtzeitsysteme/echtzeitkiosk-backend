import { getConnectionManager } from 'typeorm';

import { logger } from './logger';

export const closeDBConnection = async (): Promise<boolean> => {
  const conn = getConnectionManager().get();

  if (conn.isConnected) {
    conn
      .close()
      .then(() => {
        logger.info('DB conn closed');

        return true;
      })
      .catch((err: any) => {
        logger.error('Error clossing conn to DB, ', err);
        return false;
      });
  } else {
    logger.info('DB conn already closed.');
  }

  return false;
};
