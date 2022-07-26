import { IsDate, IsUUID } from 'class-validator';
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @Column({ name: 'updated_at' })
  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column('text', { name: 'comment', nullable: true })
  comment: string | null;
}
