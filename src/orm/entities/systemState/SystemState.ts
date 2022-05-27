import { Column, Entity } from 'typeorm';

import { config } from 'config/config';
import { AbstractEntity } from 'utils/AbstractEntity';

@Entity('system_state', { schema: 'public' })
export class SystemState extends AbstractEntity {
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  previousBalance: number;

  @Column({
    name: 'previous_balance_date',
    nullable: true,
  })
  previousBalanceDate: Date;

  // add invitation code for registration to system
  @Column({ name: 'invitation_code', default: config.deployment.invitationCode })
  invitationCode: string;
}
