import { Entity, JoinColumn, ManyToOne, Column, OneToMany } from 'typeorm';

import { CustomerInvoiceType, CustomerInvoiceStatus } from 'consts/CustomerInvoice';
import { AbstractEntity } from 'utils/AbstractEntity';
import { ColumnNumericTransformer } from 'utils/ColumnNumericTransformer';

import { CustomerOrder } from '../customerOrders/CustomerOrder';
import { User } from '../users/User';

@Entity('customer_invoice', { schema: 'public' })
export class CustomerInvoice extends AbstractEntity {
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'total',
    transformer: new ColumnNumericTransformer(),
  })
  total: number | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'current_user_balance',
    transformer: new ColumnNumericTransformer(),
  })
  currentUserBalance: number | null;

  @Column({
    name: 'customer_invoice_month_year',
    nullable: true,
  })
  customerInvoiceMonthYear: string | null; // format: MM-YYYY

  @OneToMany(() => CustomerOrder, (customerOrder) => customerOrder.customerInvoice)
  customerOrders: CustomerOrder[];

  @ManyToOne(() => User, (user) => user.customerInvoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;

  @Column({
    name: 'customer_invoice_type',
    type: 'enum',
    enum: CustomerInvoiceType,
    default: CustomerInvoiceType.MONTHLY,
  })
  customerInvoiceType: CustomerInvoiceType;

  @Column({
    name: 'customer_invoice_status',
    type: 'enum',
    enum: CustomerInvoiceStatus,
    default: CustomerInvoiceStatus.PENDING,
  })
  customerInvoiceStatus: CustomerInvoiceStatus;
}
