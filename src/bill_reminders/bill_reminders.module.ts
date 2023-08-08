import { Module } from '@nestjs/common';
import { BillRemindersController } from './controller/bill_reminders.controller';
import { BillRemindersService } from './service/bill_reminders.service';
import { BillReminderEntity } from './model/bill_reminder.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { AccountModule } from 'src/account/account.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillReminderEntity]),
    AuthModule,
    UserModule,
    AccountModule,
    TransactionModule,
  ],
  controllers: [BillRemindersController],
  providers: [BillRemindersService],
})
export class BillRemindersModule {}
