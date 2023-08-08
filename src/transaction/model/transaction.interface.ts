import { AccountEntry } from 'src/account/model/account.interface';
import { CategoryEntry } from 'src/category/model/category.interface';
import { ScheduledTransactionEntry } from 'src/scheduled_transactions/model/scheduledTransaction.interface';
import { User } from 'src/user/models/user.interface';

export interface TransactionEntry {
  id?: number;
  amount?: number;
  status?: number;
  type?: TransactionType;
  category?: CategoryEntry;
  account?: AccountEntry;
  scheduledTransactionId?: ScheduledTransactionEntry;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  SUBSCRIPTION = 'subscription',
}
