import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// import { config } from '../../config/config';
import { CustomerInvoice } from '../../orm/entities/customerInvoices/CustomerInvoice';
import { CustomerOrderItem } from '../../orm/entities/customerOrderItems/CustomerOrderItem';
import { CustomerOrder } from '../../orm/entities/customerOrders/CustomerOrder';
import { Product } from '../../orm/entities/products/Product';
// import { Supplier } from '../../orm/entities/suppliers/Supplier';
import { SystemState } from '../../orm/entities/systemState/SystemState';
import { Token } from '../../orm/entities/tokens/Token';
import { User } from '../../orm/entities/users/User';

const ormConfig: ConnectionOptions = {
  type: 'postgres',
  name: 'default',

  // host: config.postgres.host,
  // port: config.postgres.port,
  // username: config.postgres.user,
  // password: config.postgres.password,
  // database: config.postgres.dbName,

  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,

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
