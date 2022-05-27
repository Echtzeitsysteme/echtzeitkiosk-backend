import {
  Entity,
  Column,
  // OneToMany
} from 'typeorm';

import { AbstractEntity } from 'utils/AbstractEntity';

@Entity('product_types')
export class ProductType extends AbstractEntity {
  @Column({ unique: true })
  name: string;
}
