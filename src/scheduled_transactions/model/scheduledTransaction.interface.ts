import { AccountEntry } from 'src/account/model/account.interface';
import { CategoryEntry } from 'src/category/model/category.interface';
import { User } from 'src/user/models/user.interface';

export interface ScheduledTransactionEntry {
  id?: number;
  amount?: number;
  status?: number;
  isActive?: number;
  type?: TransactionType;
  category?: CategoryEntry;
  account?: AccountEntry;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
  nextCronDate?: Date;
  frequency?: FrequencyType;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  SUBSCRIPTION = 'subscription',
}

export enum FrequencyType {
  DAILY = 'daily',
  EVERY_15_DAYS = 'every_15_days',
  MONTHLY = 'monthly',
}
