import { Length, IsEmail, IsPhoneNumber } from 'class-validator';
import {
  Entity,
  Column,
  // OneToMany,
  //OneToMany
} from 'typeorm';

import { AbstractEntity } from 'utils/AbstractEntity';

// import { SupplyOrderItem } from '../supplyOrderItems/SupplyOrderItem';

@Entity('suppliers')
export class Supplier extends AbstractEntity {
  @Column({ unique: true })
  @Length(4, 100)
  name: string;

  @Column({ name: 'address', nullable: true })
  address: string | null;

  @Column({ name: 'phone_number', nullable: true })
  @IsPhoneNumber()
  phoneNumber: string | null;

  @Column({ nullable: true })
  @IsEmail()
  email: string | null;

  // @OneToMany(() => SupplyOrderItem, (supplyOrderItem) => supplyOrderItem.product)
  // supplyOrderItems: SupplyOrderItem[];
}
