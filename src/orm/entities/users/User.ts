import bcrypt from 'bcryptjs';
import { Length, IsEmail, IsDate } from 'class-validator';
import { Entity, Column, OneToMany } from 'typeorm';

import { RoleType } from 'consts/RoleType';
import { AbstractEntity } from 'utils/AbstractEntity';
import { ColumnNumericTransformer } from 'utils/ColumnNumericTransformer';

import { Language } from '../../../consts/Language';
import { CustomerInvoice } from '../customerInvoices/CustomerInvoice';
import { CustomerOrder } from '../customerOrders/CustomerOrder';
import { Token } from '../tokens/Token';

@Entity('users')
export class User extends AbstractEntity {
  @Column({ type: 'enum', enum: RoleType, default: RoleType.STANDARD })
  role: RoleType;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  // @Exclude()
  @Column({ nullable: true })
  // @Column({ select: false })
  password: string;

  @Column({ unique: true })
  @Length(3, 30)
  username: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', nullable: true })
  lastName: string | null;

  @Column({
    name: 'is_email_verified',
    default: false,
  })
  isEmailVerified: boolean;

  @Column({
    name: 'is_first_time_login',
    default: true,
  })
  isFirstTimeLogin: boolean;

  @Column({
    name: 'is_approved',
    default: false,
  })
  isApproved: boolean;

  @Column({
    name: 'is_email_notf_for_order_enabled',
    default: false,
  })
  isEmailNotfForOrderEnabled: boolean;

  @Column({
    default: 'de-DE' as Language,
    length: 15,
  })
  language: string; // required for emails

  @Column({ name: 'last_login', nullable: true })
  @IsDate()
  lastLogin: Date | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
  balance: number;

  @Column({
    type: 'numeric',
    name: 'total_spent',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  totalSpent: number; // TODO use/implement this field

  @OneToMany(() => CustomerOrder, (customerOrder) => customerOrder.user)
  customerOrders: CustomerOrder[];

  @OneToMany(() => CustomerInvoice, (customerInvoice) => customerInvoice.user)
  customerInvoices: CustomerInvoice[];

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  setLanguage(language: Language) {
    this.language = language;
  }

  static getVerifyEmailToken = async (user: User) => {
    const verifyEmailToken = await Token.generateVerifyEmailToken(user);
    return verifyEmailToken;
  };

  static getResetPasswordToken = async (email: string) => {
    const resetPasswordToken = await Token.generateResetPasswordToken(email);
    return resetPasswordToken;
  };

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
    return this.password;
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
