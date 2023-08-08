import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Put,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { AccountEntry } from '../model/account.interface';
import { AccountService } from '../service/account.service';

@Controller('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() account: AccountEntry,
    @Request() req,
  ): Observable<AccountEntry> {
    console.log(account);
    const user = req.user;
    return this.accountService.create(account, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateOne(
    @Param() params: AccountEntry,
    @Body() account: AccountEntry,
  ): Observable<AccountEntry> {
    return this.accountService.updateOne(Number(params.id), account);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param() params: AccountEntry,
    @Request() req,
  ): Observable<AccountEntry> {
    return this.accountService.findOne(Number(params.id));
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req): Observable<AccountEntry[]> {
    const user = req.user;
    return this.accountService.findAll(Number(user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteOne(@Param() params: AccountEntry): Observable<any> {
    return this.accountService.deleteOne(Number(params.id));
  }
}
