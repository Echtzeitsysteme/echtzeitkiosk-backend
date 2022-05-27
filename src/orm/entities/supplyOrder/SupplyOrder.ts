/** 
 * import { Column, Entity, Index, 
    JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { Supplier } from '../suppliers/Supplier';
import { AbstractEntity } from 'utils/AbstractEntity';
 */

//foreign keys are on the many side, not one side

// import { CustomerOrderItem } from '../customerOrderItems/CustomerOrderItem';
// import { User } from '../users/User';

// @Index('customer_order_pkey', ['id'], { unique: true })
// @Index('idx_customer_order_user', ['userId'], {})
// @Entity('customer_order', { schema: 'public' })
// export class CustomerOrder extends AbstractEntity {
//   @Column('bigint', { name: 'userId' })
//   userId: string;

//   @Column('double precision', {
//     name: 'total',
//     precision: 53,
//     default: () => "'0'",
//   })
//   total: number;

//   @ManyToOne(() => User, (user) => user.customerOrders)
//   @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
//   user: User;

//   @OneToMany(() => CustomerOrderItem, (customerOrderItem) => customerOrderItem.customerOrder)
//   customerOrderItems: CustomerOrderItem[];
// }
