import fs from 'fs';
import path from 'path';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import './utils/response/customSuccess';
import { closeDBConnection } from 'utils/dbCloseConnection';
import { dbCreateConnectionAndCreateDefaultTablesWithDefaultValuesIfNotExists } from 'utils/dbCreateConnectionAndCreateDefaultTablesWithDefaultValuesIfNotExists';

import { MonthlyInvoiceCronJobManager } from './helpers/invoices';
import { errorHandler } from './middleware/errorHandler';
import { getLanguage } from './middleware/getLanguage';
import routes from './routes';
import { morganErrorHandler, morganSuccessHandler } from './utils/customMorgan';
import { logger } from './utils/logger';

export const app = express();

app.use(
  cors({
    origin: [
      'http://echtzeitkiosk.mertalpulus.eu',
      'https://echtzeitkiosk.mertalpulus.eu',

      'http://localhost:3000',
      'https://localhost:3000',

      'http://192.168.1.111:3000',
      'https://192.168.1.111:3000',

      'http://kiosk.fg.es.e-technik.tu-darmstadt.de',
      'https://kiosk.fg.es.e-technik.tu-darmstadt.de',
    ],
    credentials: true,
  }),
);

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(getLanguage);

try {
  const accessLogStream = fs.createWriteStream(path.join(__dirname, '../log/access.log'), {
    flags: 'a',
  });
  app.use(morgan('combined', { stream: accessLogStream }));
  app.use(morganErrorHandler);
  app.use(morganSuccessHandler);
} catch (err) {
  logger.error(err);
}

app.use('/', routes);

app.use(errorHandler);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Node.js Version: ${process.version}`);
  logger.info(`Running on: ${process.platform}`);
  logger.info(`Server Time: ${new Date()}`);
});

(async () => {
  await dbCreateConnectionAndCreateDefaultTablesWithDefaultValuesIfNotExists();

  logger.info(`Current Date Time: ${new Date()}`);
  MonthlyInvoiceCronJobManager.startAllJobs();
  console.log('MonthlyInvoiceCronJobManager:', MonthlyInvoiceCronJobManager.getAllJobs());
})();

const exitHandler = () => {
  if (server) {
    closeDBConnection();

    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  exitHandler();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  exitHandler();
});
