// import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

// // Import Classes
// import { AbstractEntity } from 'utils/AbstractEntity';

// import { Product } from '../products/Product';
// import { Supplier } from '../suppliers/Supplier';

// // Create new Class
// @Entity('supplyOrderItem')
// export class SupplyOrderItem extends AbstractEntity {
//   @Column('bigint', { name: 'productId' })
//   productId: string;

//   @Column('smallint', { name: 'quantity', default: () => "'0'" }) // or just 0 ?
//   quantity: number;

//   @Column({
//     type: 'numeric',
//     precision: 6,
//     scale: 2,
//     // ,default: 0.00
//   })
//   subtotal: number;

//   @ManyToOne(() => Product, (product) => product.id)
//   @JoinColumn([{ name: 'productId', referencedColumnName: 'id' }])
//   product: Product;

//   //   @ManyToOne(() => Item, (item) => item.customerOrderItems)
//   //   @JoinColumn([{ name: 'itemId', referencedColumnName: 'id' }])
//   //   item: Item;

//   // productID
//   // supplierID
//   // quantity

//   // in products --> Costper unit
// }

// // import { SupplyOrder } from '../supplyOrders/SupplyOrder';
// // import { Item } from './Item';

// // @Index('customer_order_item_pkey', ['id'], { unique: true })
// // @Index('idx_customer_order_item_item', ['itemId'], {})
// // @Index('idx_customer_order_item_product', ['productId'], {})
// // @Entity('customer_order_item', { schema: 'public' })
// // export class CustomerOrderItem {
// //   @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
// //   id: number;

// //   @Column('bigint', { name: 'productId' })
// //   productId: string;

// //   @Column('bigint', { name: 'itemId' })
// //   itemId: string;

// //   @Column('character varying', { name: 'sku', length: 100 })
// //   sku: string;

// //   @Column('smallint', { name: 'quantity', default: () => "'0'" })
// //   quantity: number;

// //   @Column('double precision', {
// //     name: 'subtotal',
// //     precision: 53,
// //     default: () => "'0'",
// //   })
// //   subtotal: number;

// // }
