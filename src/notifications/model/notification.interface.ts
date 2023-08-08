import { User } from 'src/user/models/user.interface';

export interface NotificationEntry {
  id?: number;
  name?: string;
  description?: string;
  type?: NotificationType;
  isRead?: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
}

export enum NotificationType {
  PASSWORD_CHANGE = 'password_change',
  ISSUING_SCHEDULED_TRANSACTION = 'issuing_scheduled_transaction',
  BILL_REMINDER = 'bill_reminder',
  SUBSCRIPTION_EXPIRATION = 'subscription_expiration',
}
