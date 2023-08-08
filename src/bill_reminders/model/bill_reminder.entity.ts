import { Transaction } from 'src/transaction/model/transaction.entity';
import { UserEntity } from 'src/user/models/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('bill_reminder')
export class BillReminderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column()
  description: string;

  @Column()
  amount: number;

  @Column({ default: 0 })
  isCompleted: number;

  @Column({ default: 1 })
  status: number;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  user: UserEntity;

  @OneToMany(() => Transaction, (transaction) => transaction.bill)
  transactions: Transaction[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
