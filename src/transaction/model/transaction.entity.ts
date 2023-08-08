import { AccountEntity } from 'src/account/model/account.entity';
import { Category } from 'src/category/model/category.entity';
import { UserEntity } from 'src/user/models/user.entity';

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionType } from './transaction.interface';
import { ScheduledTransaction } from 'src/scheduled_transactions/model/scheduledTransaction.entity';
import { BillReminderEntity } from 'src/bill_reminders/model/bill_reminder.entity';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ default: 1 })
  status: number;

  @ManyToOne(() => Category, (category) => category.transactions)
  category: Category;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  user: UserEntity;

  @ManyToOne((type) => AccountEntity, (account) => account.transactions)
  account: AccountEntity;

  @ManyToOne(
    () => ScheduledTransaction,
    (scheduledTransaction) => scheduledTransaction.transactions,
  )
  scheduledTransaction: ScheduledTransaction;

  @ManyToOne((type) => BillReminderEntity, (bill) => bill.transactions)
  bill: BillReminderEntity;

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
