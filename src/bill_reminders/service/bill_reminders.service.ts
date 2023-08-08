import { Injectable } from '@nestjs/common';
import { BillReminderEntity } from '../model/bill_reminder.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { User } from 'src/user/models/user.interface';
import { BillReminderEntry } from '../model/bill_reminder.interface';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { Connection } from 'typeorm';

@Injectable()
export class BillRemindersService {
  constructor(
    @InjectRepository(BillReminderEntity)
    private readonly billRepository: Repository<BillReminderEntity>,
    private readonly connection: Connection, // add this line
  ) {}

  create(user: User, bill: BillReminderEntry): Observable<BillReminderEntry> {
    bill.user = user;
    const queryRunner = this.connection.createQueryRunner();

    return from(
      queryRunner.connect().then(async (connection) => {
        await queryRunner.startTransaction();

        try {
          const result = await this.billRepository.save(bill);

          await queryRunner.commitTransaction();
          delete result.user;
          return result;
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      }),
    );
  }

  updateOne(
    id: number,
    bill: BillReminderEntry,
  ): Observable<BillReminderEntry> {
    return from(this.billRepository.update(id, bill)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }

  findOne(id: number): Observable<BillReminderEntry> {
    return from(
      this.billRepository.findOne({
        where: {
          id: id,
        },
        relations: ['transactions'],
      }),
    ).pipe(
      switchMap((result) => {
        if (!result) {
          return throwError(
            new Error(`Bill reminder with ID ${id} not found.`),
          );
        }

        delete result.user;
        return from([result]);
      }),
      catchError((error) => {
        return throwError(error);
      }),
    );
  }

  findAll(id: number): Observable<BillReminderEntry[]> {
    return from(
      this.billRepository.find({
        where: {
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
      map((bills) => {
        return bills;
      }),
    );
  }

  async toggleTransactionStatus(id: number): Promise<any> {
    const currentReminder = await this.billRepository.findOne({
      where: {
        id: id,
      },
    });
    let newStatus = null;
    currentReminder.isCompleted === 0 ? (newStatus = 1) : (newStatus = 0);
    return await this.billRepository.update(id, {
      isCompleted: newStatus,
    });
  }

  async deleteOne(id: number): Promise<any> {
    return await this.billRepository.update(id, { status: 0 });
  }
}
