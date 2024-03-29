import { IsUrl } from 'class-validator';
import { Entity, Column, OneToMany, DeleteDateColumn } from 'typeorm';

// import { ProductCategory, ProductType } from 'consts';
import { AbstractEntity } from 'utils/AbstractEntity';
import { ColumnNumericTransformer } from 'utils/ColumnNumericTransformer';

import { CustomerOrderItem } from '../customerOrderItems/CustomerOrderItem';

@Entity('products')
export class Product extends AbstractEntity {
  @DeleteDateColumn() // https://wanago.io/2021/10/25/api-nestjs-soft-deletes-postgresql-typeorm/
  deletedAt: Date;

  @Column({ unique: true })
  productTitle: string;

  @Column({ type: 'smallint', name: 'quantity', default: 0 })
  quantity: number;

  @Column({ name: 'product_photo_url', nullable: true })
  @IsUrl()
  productPhotoUrl: string | null;

  @Column({
    name: 'resale_price_per_unit',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  resalePricePerUnit: number;

  @OneToMany(() => CustomerOrderItem, (customerOrderItem) => customerOrderItem.product)
  customerOrderItem: CustomerOrderItem[];

  id: string;
}
