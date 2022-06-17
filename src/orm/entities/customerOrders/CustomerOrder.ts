import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from 'utils/AbstractEntity';
import { ColumnNumericTransformer } from 'utils/ColumnNumericTransformer';

import { CustomerInvoice } from '../customerInvoices/CustomerInvoice';
import { CustomerOrderItem } from '../customerOrderItems/CustomerOrderItem';
import { User } from '../users/User';

@Entity('customer_orders', { schema: 'public' })
export class CustomerOrder extends AbstractEntity {
  [x: string]: any; // for monthly_customer_invoice_id

  @Column({
    precision: 5,
    scale: 2,
    nullable: true,
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
  })
  total: number | null;

  @OneToMany(() => CustomerOrderItem, (customerOrderItem) => customerOrderItem.customerOrder)
  customerOrderItems: CustomerOrderItem[];

  @ManyToOne(() => User, (user) => user.customerOrders, {
    // onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User = new User();

  @ManyToOne(() => CustomerInvoice, (customerInvoice) => customerInvoice.customerOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'monthly_customer_invoice_id', referencedColumnName: 'id' }])
  customerInvoice: CustomerInvoice = new CustomerInvoice();
}
