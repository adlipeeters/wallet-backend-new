import { Module } from '@nestjs/common';
import { AccountService } from './service/account.service';
import { AccountController } from './controller/account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './model/account.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity]), AuthModule, UserModule],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
