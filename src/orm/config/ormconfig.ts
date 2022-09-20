import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { config } from '../../config/config';
import { CustomerInvoice } from '../../orm/entities/customerInvoices/CustomerInvoice';
import { CustomerOrderItem } from '../../orm/entities/customerOrderItems/CustomerOrderItem';
import { CustomerOrder } from '../../orm/entities/customerOrders/CustomerOrder';
import { Product } from '../../orm/entities/products/Product';
import { SystemState } from '../../orm/entities/systemState/SystemState';
import { Token } from '../../orm/entities/tokens/Token';
import { User } from '../../orm/entities/users/User';

const ormConfig: ConnectionOptions = {
  type: 'postgres',
  name: 'default',

  ...(config.env === 'test' && {
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test',
  }),
  ...(config.env === 'development' && {
    host: config.postgres.host,
    port: config.postgres.port,
    username: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.dbName,
  }),
  ...(config.env === 'production' && {
    host: config.postgres.host,
    port: config.postgres.port,
    username: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.dbName,
  }),

  synchronize: true,
  logging: false,
  entities: [User, Token, SystemState, CustomerInvoice, CustomerOrderItem, CustomerOrder, Product],

  migrations: ['src/orm/migrations/**/*.{.ts,.js}'],
  subscribers: ['src/orm/subscriber/**/*.{.ts,.js}'],
  cli: {
    entitiesDir: 'src/orm/entities',
    migrationsDir: 'src/orm/migrations',
    subscribersDir: 'src/orm/subscriber',
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export = ormConfig;
