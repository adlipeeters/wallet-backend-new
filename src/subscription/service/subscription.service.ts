import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from '../model/subscription.entity';
import { Subscription } from '../model/subscription.interface';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
  ) {}
  create(subscription: Subscription): Observable<Subscription> {
    return from(this.subscriptionRepository.save(subscription));
  }

  findAll(): Observable<Subscription[]> {
    return from(
      this.subscriptionRepository.find({
        where: {
          status: 1,
        },
        order: { id: 'DESC' },
      }),
    ).pipe(
      map((subscriptions) => {
        return subscriptions;
      }),
    );
  }
}
