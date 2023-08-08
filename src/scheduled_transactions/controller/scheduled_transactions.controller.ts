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
import { ScheduledTransactionsService } from '../service/scheduled_transactions.service';
import { ScheduledTransactionEntry } from '../model/scheduledTransaction.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { Observable } from 'rxjs';
import { UserIsUserGuard } from 'src/auth/guards/UserIsUser.guard';
import { Cron } from '@nestjs/schedule';

@Controller('scheduled-transactions')
export class ScheduledTransactionsController {
  constructor(
    private scheduledTransactionService: ScheduledTransactionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() transaction: ScheduledTransactionEntry,
    @Request() req,
  ): Observable<ScheduledTransactionEntry> {
    const user = req.user;
    return this.scheduledTransactionService.create(user, transaction);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req): Observable<ScheduledTransactionEntry[]> {
    const user = req.user;
    return this.scheduledTransactionService.findAll(Number(user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param() params: ScheduledTransactionEntry,
  ): Observable<ScheduledTransactionEntry> {
    return this.scheduledTransactionService.findOne(Number(params.id));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateOne(
    @Param() params: ScheduledTransactionEntry,
    @Body() transaction: ScheduledTransactionEntry,
    @Request() req,
  ): any {
    const user = req.user;
    return this.scheduledTransactionService.updateOne(
      user,
      Number(params.id),
      transaction,
    );
  }

  @Delete(':id')
  deleteOne(@Param() params: ScheduledTransactionEntry): any {
    return this.scheduledTransactionService.deleteOne(Number(params.id));
  }

  @Post('toggleStatus/:id')
  togglStatus(@Param() params: ScheduledTransactionEntry): any {
    return this.scheduledTransactionService.toggleTransactionStatus(
      Number(params.id),
    );
  }

  @Post('/test')
  async test() {
    return this.scheduledTransactionService.test();
  }
}
