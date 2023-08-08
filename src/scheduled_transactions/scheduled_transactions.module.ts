import { Module } from '@nestjs/common';
import { ScheduledTransactionsController } from './controller/scheduled_transactions.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { AccountModule } from 'src/account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionModule } from 'src/transaction/transaction.module';
import { ScheduledTransactionsService } from './service/scheduled_transactions.service';
import { ScheduledTransaction } from './model/scheduledTransaction.entity';
import { Transaction } from 'src/transaction/model/transaction.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledTransaction, Transaction]),
    AuthModule,
    UserModule,
    AccountModule,
    TransactionModule,
    NotificationsModule,
  ],
  providers: [ScheduledTransactionsService],
  controllers: [ScheduledTransactionsController],
  exports: [ScheduledTransactionsService],
})
export class ScheduledTransactionsModule {}
