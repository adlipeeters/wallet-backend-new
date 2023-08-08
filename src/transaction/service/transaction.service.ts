import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, switchMap } from 'rxjs';
import { AccountService } from 'src/account/service/account.service';
import { User } from 'src/user/models/user.interface';
import { In, Repository } from 'typeorm';
import { Transaction } from '../model/transaction.entity';
import {
  TransactionEntry,
  TransactionType,
} from '../model/transaction.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-parse';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private accountService: AccountService,
  ) { }

  create(
    user: User,
    transaction: TransactionEntry,
  ): Observable<TransactionEntry> {
    transaction.user = user;
    if (transaction.type !== 'subscription') {
      this.accountService.updateBalance(
        Number(transaction.account),
        transaction.amount,
        transaction.type,
      );
    }

    console.log(transaction);
    return from(this.transactionRepository.save(transaction)).pipe(
      map((result) => {
        delete result.user;
        return result;
      }),
    );
  }

  async updateOne(
    user: User,
    id: number,
    transaction: TransactionEntry,
  ): Promise<any> {
    const currentTransaction = await this.transactionRepository.findOne({
      where: { id: id },
      relations: ['account'],
    });
    const oldAmount = currentTransaction.amount;
    transaction.user = user;
    const isBalanceUpdated = await this.accountService.updateBalanceOnEdit(
      Number(currentTransaction.account.id),
      currentTransaction,
      Number(transaction.amount),
      transaction.type,
    );

    if (isBalanceUpdated) {
      return await this.transactionRepository.update(id, transaction);
    }
  }

  findOne(id: number): Observable<TransactionEntry> {
    return from(
      this.transactionRepository.findOne({
        relations: ['category', 'account'],
        where: {
          id: id,
        },
      }),
    ).pipe(
      map((result) => {
        // delete result.user.role;
        // delete result.user.email;
        // delete result.user.id;
        return result;
      }),
    );
  }

  findAll(id: number): Observable<TransactionEntry[]> {
    return from(
      this.transactionRepository.find({
        relations: ['user', 'category', 'account', 'scheduledTransaction'],
        where: {
          // modalitate multipla
          // status: In([0, 1]),
          status: 1,
          user: {
            id: id,
          },
        },
        order: {
          id: 'DESC',
        },
      }),
    ).pipe(
      map((transactions) => {
        return transactions;
      }),
    );
  }

  async deleteOne(id: number): Promise<any> {
    const currentTransaction = await this.transactionRepository.findOne({
      where: { id: id },
      relations: ['account'],
    });
    const isBalanceUpdated = await this.accountService.updateOnDelete(
      Number(currentTransaction.account.id),
      Number(currentTransaction.amount),
      currentTransaction.type,
    );
    if (isBalanceUpdated) {
      return await this.transactionRepository.update(id, { status: 0 });
    }
  }

  async parsePdf(transaction: any, dataBuffer: Buffer) {
    // const data = await pdf(dataBuffer);

    // const regex = /Suma platita (\d+\.?\d*) RON/g;
    // let match;
    // const amounts = [];

    // while ((match = regex.exec(data.text)) !== null) {
    //   amounts.push(parseFloat(match[1]));
    // }

    // return amounts;
    const data = await pdf(dataBuffer);

    const dateRegex = /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/;
    const transactionRegex = /Suma platita (\d+\.?\d*) RON/;

    const lines = data.text.split('\n');
    const transactions = [];

    let currentDate = null;

    for (const line of lines) {
      const dateMatch = dateRegex.exec(line);
      const transactionMatch = transactionRegex.exec(line);

      if (dateMatch) {
        currentDate = dateMatch[0];
      }

      if (transactionMatch && currentDate) {
        transactions.push({ date: currentDate, amount: parseFloat(transactionMatch[1]) });
        currentDate = null;
      }
    }

    transactions.forEach((item: any) => {
      const createdAt = new Date(item.date)
      const newTransaction = { amount: item.amount, createdAt: createdAt, category: transaction.category, account: transaction.account, user: transaction.user, type: TransactionType.EXPENSE }
      // console.log(newTransaction);
      this.transactionRepository.save(newTransaction)
    })

    return { transactions, transaction };
  }
}
