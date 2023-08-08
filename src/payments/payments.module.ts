import { Module } from '@nestjs/common';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UserModule } from 'src/user/user.module';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';

@Module({
  imports: [UserModule, TransactionModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentsModule {}
