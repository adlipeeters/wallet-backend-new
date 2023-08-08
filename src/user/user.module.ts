import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { ControllerController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule,
    MailModule,
    NotificationsModule,
  ],
  providers: [UserService],
  controllers: [ControllerController],
  exports: [UserService],
})
export class UserModule {}
