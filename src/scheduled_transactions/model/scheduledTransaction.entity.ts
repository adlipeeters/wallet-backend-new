import { AccountEntity } from 'src/account/model/account.entity';
import { Category } from 'src/category/model/category.entity';
import { UserEntity } from 'src/user/models/user.entity';
import { Transaction } from 'src/transaction/model/transaction.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  FrequencyType,
  TransactionType,
} from './scheduledTransaction.interface';

@Entity('scheduled_transaction')
export class ScheduledTransaction {
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

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.scheduledTransaction,
  )
  transactions: Transaction[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'date' })
  nextCronDate: Date;

  @Column()
  frequency: FrequencyType;

  @Column({ default: 1 })
  isActive: number;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
