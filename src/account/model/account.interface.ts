import { TransactionEntry } from 'src/transaction/model/transaction.interface';
import { User } from 'src/user/models/user.interface';

export interface AccountEntry {
  id?: number;
  amount?: number;
  name?: string;
  user?: User;
  transactions?: TransactionEntry[];
  status?: number;
}
