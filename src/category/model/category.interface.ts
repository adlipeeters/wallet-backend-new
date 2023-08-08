import { User } from 'src/user/models/user.interface';

export interface CategoryEntry {
  id?: number;
  name?: string;
  status?: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
}
