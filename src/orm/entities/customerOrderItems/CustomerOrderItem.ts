import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from 'utils/AbstractEntity';
import { ColumnNumericTransformer } from 'utils/ColumnNumericTransformer';

import { CustomerOrder } from '../customerOrders/CustomerOrder';
import { Product } from '../products/Product';

@Entity('customer_order_items', { schema: 'public' })
export class CustomerOrderItem extends AbstractEntity {
  @ManyToOne(() => Product, (product) => product.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'product_id', referencedColumnName: 'id' }])
  product: Product;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  subtotal: number;

  @Column({
    name: 'price_per_unit',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  pricePerUnit: number;

  @Column('smallint', { name: 'quantity', default: 0 })
  quantity: number;

  @ManyToOne(() => CustomerOrder, (customerOrder) => customerOrder.customerOrderItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'customer_order_id', referencedColumnName: 'id' }])
  customerOrder: CustomerOrder;
}
