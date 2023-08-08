import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Subscription } from '../model/subscription.interface';
import { SubscriptionService } from '../service/subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() subscription: Subscription): Observable<Subscription> {
    return this.subscriptionService.create(subscription);
  }

  @Get()
  findAll(): Observable<Subscription[]> {
    return this.subscriptionService.findAll();
  }
}
