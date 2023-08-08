import { Controller, Get, UseGuards, Request, Put, Post } from '@nestjs/common';
import { NotificationService } from '../service/notification.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { Observable } from 'rxjs';
import { NotificationEntry } from '../model/notification.interface';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req): Observable<NotificationEntry[]> {
    const user = req.user;
    return this.notificationService.findAll(Number(user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  updateOne(@Request() req): any {
    const user = req.user;
    return this.notificationService.readAll(user.id);
  }
}
