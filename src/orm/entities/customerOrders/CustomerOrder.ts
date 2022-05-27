import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from 'utils/AbstractEntity';

import { CustomerOrderItem } from '../customerOrderItems/CustomerOrderItem';
import { User } from '../users/User';

@Entity('customer_orders', { schema: 'public' })
export class CustomerOrder extends AbstractEntity {
  @Column({
    precision: 5,
    scale: 2,
    nullable: true,
    type: 'numeric',
  })
  total: number | null;

  @OneToMany(() => CustomerOrderItem, (customerOrderItem) => customerOrderItem.customerOrder)
  customerOrderItems: CustomerOrderItem[];

  @ManyToOne(() => User, (user) => user.customerOrders)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User = new User();
}
