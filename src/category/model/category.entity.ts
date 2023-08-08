import { Transaction } from 'src/transaction/model/transaction.entity';
import { TransactionType } from 'src/transaction/model/transaction.interface';
import { UserEntity } from 'src/user/models/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  ManyToOne,
  BeforeInsert,
  OneToMany,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne((type) => UserEntity, (user) => user.categories)
  user: UserEntity;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  // @BeforeUpdate()
  // nameуToLowerCase() {
  //   this.name = this.name.toLowerCase();
  // }

  @BeforeInsert()
  nameToLowerCase() {
    this.name = this.name.toLowerCase();
  }
}
