import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { AbstractEntity } from 'utils/AbstractEntity';

import { User } from '../users/User';

@Entity('customer_invoice', { schema: 'public' })
export class CustomerInvoice extends AbstractEntity {
  @OneToOne(() => User, (user) => user.balance)
  currentBalance: number;

  @ManyToOne(() => User, (user) => user.customerInvoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
