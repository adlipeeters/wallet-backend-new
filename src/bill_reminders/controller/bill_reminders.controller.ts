import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { BillRemindersService } from '../service/bill_reminders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { Observable } from 'rxjs';
import { BillReminderEntry } from '../model/bill_reminder.interface';

@Controller('bill-reminders')
export class BillRemindersController {
  constructor(private billReminderService: BillRemindersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() bill: BillReminderEntry,
    @Request() req,
  ): Observable<BillReminderEntry> {
    const user = req.user;
    return this.billReminderService.create(user, bill);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param() params: BillReminderEntry): Observable<BillReminderEntry> {
    return this.billReminderService.findOne(Number(params.id));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateOne(
    @Param() params: BillReminderEntry,
    @Body() bill: BillReminderEntry,
    @Request() req,
  ): any {
    return this.billReminderService.updateOne(Number(params.id), bill);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req): Observable<BillReminderEntry[]> {
    const user = req.user;
    return this.billReminderService.findAll(Number(user.id));
  }

  @Post('toggleStatus/:id')
  togglStatus(@Param() params: BillReminderEntry): any {
    return this.billReminderService.toggleTransactionStatus(Number(params.id));
  }

  @Delete(':id')
  deleteOne(@Param() params: BillReminderEntry): any {
    return this.billReminderService.deleteOne(Number(params.id));
  }
}
