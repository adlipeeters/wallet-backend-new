import { AccountEntry } from 'src/account/model/account.interface';
import { BlogEntry } from 'src/blog/model/blog-entry.interface';
import { Subscription } from 'src/subscription/model/subscription.interface';
import { TransactionEntry } from 'src/transaction/model/transaction.interface';

export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  accounts?: AccountEntry[];
  isConfirmed?: number;
  confirmToken?: string;
  transactions?: TransactionEntry[];
  profileImage?: string;
  blogEntries?: BlogEntry[];
  subscription?: Subscription;
  subscriptionValidUntil?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  CHIEFEDITOR = 'chiefeditor',
  EDITOR = 'editor',
  USER = 'user',
}
