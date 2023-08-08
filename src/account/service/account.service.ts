import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { TransactionEntry } from 'src/transaction/model/transaction.interface';
import { User } from 'src/user/models/user.interface';
import { Repository } from 'typeorm';
import { AccountEntity } from '../model/account.entity';
import { AccountEntry } from '../model/account.interface';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntry>,
  ) {}

  create(account: AccountEntry, user: User): Observable<AccountEntry> {
    account.user = user;
    return from(this.accountRepository.save(account)).pipe(
      map((result) => {
        delete result.user;
        return result;
      }),
    );
  }

  updateOne(id: number, account: AccountEntry): Observable<AccountEntry> {
    return from(this.accountRepository.update(id, account)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }

  // on transaction create
  async updateBalance(
    id: number,
    amount: number,
    type: string,
  ): Promise<boolean> {
    const account = await this.accountRepository.findOne({
      where: {
        id: id,
      },
    });

    let newBalance: any;
    let isUpdated: any;
    if (type === 'income') {
      newBalance = Number(account.amount) + Number(amount);
      isUpdated = await this.accountRepository.update(id, {
        amount: newBalance,
      });
      if (isUpdated) {
        return true;
      }
    } else {
      newBalance = Number(account.amount) - Number(amount);
      isUpdated = await this.accountRepository.update(id, {
        amount: newBalance,
      });
      if (isUpdated) {
        return true;
      }
    }
  }

  // on transaction edit
  async updateBalanceOnEdit(
    id: number,
    oldTransaction: TransactionEntry,
    amount: number,
    editTransType: string,
  ): Promise<boolean> {
    // console.log(id);
    const account = await this.accountRepository.findOne({
      where: {
        id: id,
      },
    });
    let newBalance: number;
    let isUpdated: any;
    const oldAmount = oldTransaction.amount;
    if (editTransType === 'income' && oldTransaction.type === 'income') {
      if (oldAmount >= amount) {
        newBalance =
          Number(account.amount) - (Number(oldAmount) - Number(amount));
      } else if (oldAmount < amount) {
        newBalance =
          Number(account.amount) + (Number(amount) - Number(oldAmount));
      }

      isUpdated = await this.accountRepository.update(id, {
        amount: newBalance,
      });
      if (isUpdated) {
        return true;
      }
    } else if (
      editTransType === 'expense' &&
      oldTransaction.type === 'expense'
    ) {
      if (oldAmount >= amount) {
        newBalance =
          Number(account.amount) + (Number(oldAmount) - Number(amount));
      } else if (oldAmount < amount) {
        newBalance =
          Number(account.amount) - (Number(amount) - Number(oldAmount));
      }
      isUpdated = await this.accountRepository.update(id, {
        amount: newBalance,
      });
      if (isUpdated) {
        return true;
      }
    } else if (
      editTransType === 'expense' &&
      oldTransaction.type === 'income'
    ) {
      newBalance = Number(account.amount) - Number(oldAmount) - Number(amount);
      isUpdated = await this.accountRepository.update(id, {
        amount: newBalance,
      });
      if (isUpdated) {
        return true;
      }
    } else if (
      editTransType === 'income' &&
      oldTransaction.type === 'expense'
    ) {
      newBalance = Number(account.amount) + Number(oldAmount) + Number(amount);
      isUpdated = await this.accountRepository.update(id, {
        amount: newBalance,
      });
      if (isUpdated) {
        return true;
      }
    }
  }

  async updateOnDelete(
    id: number,
    amount: number,
    type: string,
  ): Promise<boolean> {
    const account = await this.accountRepository.findOne({
      where: {
        id: id,
      },
    });
    let newBalance: any;
    let isUpdated: any;
    if (type === 'income') {
      newBalance = Number(account.amount) - amount;
      isUpdated = await this.accountRepository.update(id, {
        amount: newBalance,
      });
      if (isUpdated) {
        return true;
      }
    } else {
      newBalance = Number(account.amount) + amount;
      isUpdated = await this.accountRepository.update(id, {
        amount: newBalance,
      });
      if (isUpdated) {
        return true;
      }
    }
  }

  findOne(id: number): Observable<AccountEntry> {
    return from(
      this.accountRepository.findOne({
        where: {
          id: id,
        },
      }),
    ).pipe(map((result) => result));
  }

  findAll(id: number): Observable<AccountEntry[]> {
    return from(
      this.accountRepository.find({
        relations: ['user'],
        where: {
          status: 1,
          user: {
            id: id,
          },
        },
        order: {
          id: 'DESC',
        },
      }),
    ).pipe(map((account) => account));
  }

  deleteOne(id: number): Observable<any> {
    return from(this.accountRepository.update(id, { status: 0 }));
  }
}
