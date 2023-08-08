import { Transaction } from 'src/transaction/model/transaction.entity';
import { User } from 'src/user/models/user.interface';

export interface BillReminderEntry {
  id?: number;
  title?: string;
  date?: Date;
  description?: string;
  amount?: number;
  isCompleted?: number;
  transactions?: Transaction[];
  user?: User;
  status?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
