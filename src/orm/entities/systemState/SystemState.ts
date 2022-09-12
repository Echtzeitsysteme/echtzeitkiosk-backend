import { Column, Entity } from 'typeorm';

import { config } from 'config/config';
import { AbstractEntity } from 'utils/AbstractEntity';
import { ColumnNumericTransformer } from 'utils/ColumnNumericTransformer';

@Entity('system_state', { schema: 'public' })
export class SystemState extends AbstractEntity {
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
  balance: number;

  // add invitation code for registration to system
  @Column({ name: 'invitation_code', default: config.deployment.invitationCode })
  invitationCode: string;
}
