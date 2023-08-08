import { Injectable } from '@nestjs/common';
import { TransactionType } from 'src/transaction/model/transaction.interface';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { UserService } from 'src/user/service/user.service';
import Stripe from 'stripe';
import { PaymentRequestBody } from '../types/PaymentRequestBody.interface';

@Injectable()
export class PaymentService {
  private stripe: any;

  constructor(
    private userService: UserService,
    private transactionService: TransactionService,
  ) {
    this.stripe = new Stripe(process.env.API_SECRET_KEY, {
      apiVersion: '2022-08-01',
    });
  }

  async createPayment(paymentRequestBody: PaymentRequestBody): Promise<any> {
    const sumAmount = paymentRequestBody.amount;
    const user = {
      subscription: paymentRequestBody.subscription,
    };
    const saveUserSubscription = this.userService.updateOne(
      Number(paymentRequestBody.userId),
      user,
    );
    if (saveUserSubscription) {
      return this.stripe.paymentIntents.create({
        amount: sumAmount * 100,
        currency: paymentRequestBody.currency,
      });
    }
  }
}
