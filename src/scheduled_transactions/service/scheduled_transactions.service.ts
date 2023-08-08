import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduledTransaction } from '../model/scheduledTransaction.entity';
import { Equal, Repository, getConnection } from 'typeorm';
import { AccountService } from 'src/account/service/account.service';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { ScheduledTransactionEntry } from '../model/scheduledTransaction.interface';
import { User } from 'src/user/models/user.interface';
import { Observable, from, map } from 'rxjs';
import { Cron } from '@nestjs/schedule';
import { addDays, format, parse, startOfToday } from 'date-fns';
import { Transaction } from 'src/transaction/model/transaction.entity';
import { TransactionEntry } from 'src/transaction/model/transaction.interface';
import { Connection } from 'typeorm';
import { NotificationService } from 'src/notifications/service/notification.service';
import { NotificationType } from 'src/notifications/model/notification.interface';

@Injectable()
export class ScheduledTransactionsService {
  constructor(
    @InjectRepository(ScheduledTransaction)
    private readonly scheduledTransactionRepository: Repository<ScheduledTransaction>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private readonly connection: Connection, // add this line
    private notificationService: NotificationService,
  ) { }

  create(
    user: User,
    transaction: ScheduledTransactionEntry,
  ): Observable<ScheduledTransactionEntry> {
    transaction.user = user;
    return from(this.scheduledTransactionRepository.save(transaction)).pipe(
      map((result) => {
        delete result.user;
        return result;
      }),
    );
  }

  findAll(id: number): Observable<ScheduledTransactionEntry[]> {
    return from(
      this.scheduledTransactionRepository.find({
        relations: ['user', 'category', 'account', 'transactions'],
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

  findOne(id: number): Observable<ScheduledTransactionEntry> {
    return from(
      this.scheduledTransactionRepository.findOne({
        relations: ['category', 'account', 'transactions'],
        where: {
          id: id,
        },
      }),
    ).pipe(
      map((result) => {
        return result;
      }),
    );
  }

  async updateOne(
    user: User,
    id: number,
    transaction: ScheduledTransactionEntry,
  ): Promise<any> {
    // transaction.user = user;
    return await this.scheduledTransactionRepository.update(id, transaction);
  }

  async deleteOne(id: number): Promise<any> {
    return await this.scheduledTransactionRepository.update(id, { status: 0 });
  }

  async toggleTransactionStatus(id: number): Promise<any> {
    const currentTransaction =
      await this.scheduledTransactionRepository.findOne({
        where: {
          id: id,
        },
      });
    let newStatus = null;
    currentTransaction.isActive === 0 ? (newStatus = 1) : (newStatus = 0);
    return await this.scheduledTransactionRepository.update(id, {
      isActive: newStatus,
    });
  }

  // @Cron('0 8 * * *')//everyday at 08:00
  // @Cron('0 * * * *') // Runs every hour
  @Cron('*/5 * * * * *') //every 5 seconds
  async issue_scheduled_transactions(): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const transactions = await this.scheduledTransactionRepository.find({
      relations: ['user', 'category', 'account'],
      where: {
        status: 1,
        isActive: 1,
      },
      order: {
        id: 'DESC',
      },
    });

    const todayTransactions = transactions.filter((transaction) => {
      const cronDate = format(new Date(transaction.nextCronDate), 'yyyy-MM-dd');
      return cronDate === today;
    });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // console.log(todayTransactions);
    // return;
    try {
      for (const transaction of todayTransactions) {
        const { id, frequency, nextCronDate } = transaction;

        // console.log(transaction.account);
        const updateBalance = await this.accountService.updateBalance(
          Number(transaction.account.id),
          transaction.amount,
          transaction.type,
        );

        // console.log(updateBalance);

        const saveTransaction = await queryRunner.manager.save(Transaction, {
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          user: transaction.user,
          account: transaction.account,
          scheduledTransaction: transaction,
        });

        console.log(saveTransaction);

        let notificationDescription =
          'The scheduled transaction was issued successfully. ';
        if (transaction.type === 'income') {
          notificationDescription +=
            ' ' +
            transaction.amount +
            ' RON has been added to your ' +
            transaction.account.name +
            ' account.';
        } else if (transaction.type === 'expense') {
          notificationDescription +=
            ' ' +
            transaction.amount +
            ' RON were passed as an expense in your ' +
            transaction.account.name +
            ' account.';
        }
        await this.notificationService.create(transaction.user, {
          name: 'Scheduled transaction',
          type: NotificationType.ISSUING_SCHEDULED_TRANSACTION,
          description: notificationDescription,
        });

        if (updateBalance) {
          if (frequency == 'daily') {
            await queryRunner.manager.update(ScheduledTransaction, id, {
              nextCronDate: format(
                addDays(new Date(nextCronDate), 1),
                'yyyy-MM-dd',
              ),
            });
          } else if (frequency == 'every_15_days') {
            await queryRunner.manager.update(ScheduledTransaction, id, {
              nextCronDate: format(
                addDays(new Date(nextCronDate), 15),
                'yyyy-MM-dd',
              ),
            });
          } else if (frequency == 'monthly') {
            await queryRunner.manager.update(ScheduledTransaction, id, {
              nextCronDate: format(
                addDays(new Date(nextCronDate), 30),
                'yyyy-MM-dd',
              ),
            });
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async test(): Promise<void> {
    return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const transactions = await this.scheduledTransactionRepository.find({
      relations: ['user', 'category', 'account'],
      where: {
        status: 1,
        isActive: 1,
      },
      order: {
        id: 'DESC',
      },
    });

    const todayTransactions = transactions.filter((transaction) => {
      const cronDate = format(new Date(transaction.nextCronDate), 'yyyy-MM-dd');
      return cronDate === today;
    });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const transaction of todayTransactions) {
        const { id, frequency, nextCronDate } = transaction;

        console.log(transaction.account);
        const updateBalance = await this.accountService.updateBalance(
          Number(transaction.account.id),
          transaction.amount,
          transaction.type,
        );

        await queryRunner.manager.save(Transaction, {
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          user: transaction.user,
          account: transaction.account,
          scheduledTransaction: transaction,
        });

        if (updateBalance) {
          if (frequency == 'daily') {
            await queryRunner.manager.update(ScheduledTransaction, id, {
              nextCronDate: format(
                addDays(new Date(nextCronDate), 1),
                'yyyy-MM-dd',
              ),
            });
          } else if (frequency == 'every_15_days') {
            await queryRunner.manager.update(ScheduledTransaction, id, {
              nextCronDate: format(
                addDays(new Date(nextCronDate), 15),
                'yyyy-MM-dd',
              ),
            });
          } else if (frequency == 'monthly') {
            await queryRunner.manager.update(ScheduledTransaction, id, {
              nextCronDate: format(
                addDays(new Date(nextCronDate), 30),
                'yyyy-MM-dd',
              ),
            });
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
