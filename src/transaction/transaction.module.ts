import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { TransactionController } from './controller/transaction.controller';
import { Transaction } from './model/transaction.entity';
import { TransactionService } from './service/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AuthModule,
    UserModule,
    AccountModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
