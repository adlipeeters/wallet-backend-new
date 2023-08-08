/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { UserRole } from './user.interface';
import { BlogEntryEntity } from 'src/blog/model/blog-entry.entity';
import { Category } from 'src/category/model/category.entity';
import { Transaction } from 'src/transaction/model/transaction.entity';
import { AccountEntity } from 'src/account/model/account.entity';
import { SubscriptionEntity } from 'src/subscription/model/subscription.entity';
import { BillReminderEntity } from 'src/bill_reminders/model/bill_reminder.entity';
import { NotificationEntity } from 'src/notifications/model/notification.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // @Column({ unique: true })
  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  profileImage: string;

  // 0 -> no
  // 1 -> yes
  @Column({ default: 0 })
  isConfirmed: number;

  @Column({ nullable: true })
  confirmToken: string;

  @OneToMany(
    (type) => BlogEntryEntity,
    (blogEntryEntity) => blogEntryEntity.author,
  )
  blogEntries: BlogEntryEntity[];

  @OneToMany((type) => Category, (categoryEntity) => categoryEntity.user)
  categories: Category[];

  @OneToMany((type) => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany((type) => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @OneToMany((type) => AccountEntity, (account) => account.user)
  accounts: AccountEntity[];

  @OneToMany((type) => BillReminderEntity, (bill) => bill.user)
  bills: BillReminderEntity[];

  @ManyToOne((type) => SubscriptionEntity, (subscription) => subscription.user)
  subscription: SubscriptionEntity;

  @Column({ nullable: true })
  subscriptionValidUntil: Date;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
