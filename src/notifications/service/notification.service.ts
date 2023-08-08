import { Injectable } from '@nestjs/common';
import { NotificationEntity } from '../model/notification.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, map, switchMap } from 'rxjs';
import {
  NotificationEntry,
  NotificationType,
} from '../model/notification.interface';
import { User } from 'src/user/models/user.interface';
import { format } from 'date-fns';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  create(user: User, notification: NotificationEntry): any {
    notification.user = user;
    return from(this.notificationRepository.save(notification));
  }

  updateOne(
    id: number,
    notification: NotificationEntry,
  ): Observable<NotificationEntry> {
    return from(this.notificationRepository.update(id, notification)).pipe(
      switchMap(() =>
        this.notificationRepository.findOne({
          where: {
            id: id,
          },
        }),
      ),
    );
  }

  async readAll(id: number): Promise<any> {
    return from(
      this.notificationRepository.update(
        {
          isRead: 0,
          user: { id: id },
        },
        { isRead: 1 },
      ),
    );
  }

  findAll(id: number): Observable<NotificationEntry[]> {
    return from(
      this.notificationRepository.find({
        where: {
          //   isRead: 1,
          //   status: In([1, 2]),
          user: {
            id: id,
          },
        },
        order: {
          id: 'DESC',
        },
      }),
    ).pipe(
      map((notifications) => {
        return notifications;
      }),
    );
  }
}
