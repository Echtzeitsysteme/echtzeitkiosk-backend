import morgan from 'morgan';

import { config } from '../config/config';

import { logger } from './logger';

const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');

const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;

const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;

export const morganErrorHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

export const morganSuccessHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});
