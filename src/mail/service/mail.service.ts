import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  // async sendUserConfirmation(token: string, name: string, email: string) {
  //   const user = {
  //     email: email,
  //     name: name,
  //     token: token,
  //   };
  //   // const url = `example.com/auth/confirm?token=${token}`;

  //   await this.mailerService.sendMail({
  //     to: user.email,
  //     from: '"Wallet App Team" <support@wallet.com>', // override default from
  //     subject: 'Welcome to Wallet 1.0 App! Confirm your Email',
  //     template: './confirmation', // `.hbs` extension is appended automatically
  //     context: {
  //       // ✏️ filling curly brackets with content
  //       name: user.name,
  //       token: token,
  //       // url,
  //     },
  //   });
  // }
  // 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
  async sendUserConfirmation(token: string, name: string, email: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, no-var
    var Sib = require('sib-api-v3-sdk');
    // eslint-disable-next-line prefer-const
    let defaultClient = Sib.ApiClient.instance;
    // eslint-disable-next-line no-var
    var apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey =
      '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';

    const tranEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email: 'adlipeeters@gmail.com',
      name: 'Smart Wallet Team',
    };

    const receivers = [{ email: 'adlipeeters.work@gmail.com' }];
    tranEmailApi
      .sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Register confirmation',
        textContent: 'This is the code: 193412',
        // htmlContent,
      })
      .then(() => {
        console.log('success');
      })
      .catch((error) => console.log(error));
  }

  async sendBulkEmailExample() {
    // users: { token: string; name: string; email: string }[],
    // eslint-disable-next-line @typescript-eslint/no-var-requires, no-var
    var Sib = require('sib-api-v3-sdk');
    // eslint-disable-next-line prefer-const
    let defaultClient = Sib.ApiClient.instance;
    // eslint-disable-next-line no-var
    var apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey =
      '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';

    const tranEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email: 'adlipeeters@gmail.com',
      name: 'Smart Wallet Team',
    };

    const users = [
      { email: 'adlipeeters.work@gmail.com', token: 'test' },
      { email: 'usatii.andrei062000@gmail.com', token: 'test' },
    ];

    users.forEach(async (user) => {
      const receivers = [{ email: user.email }];
      try {
        await tranEmailApi.sendTransacEmail({
          sender,
          to: receivers,
          subject: 'Register confirmation',
          textContent: `This is the code: ${user.token}`,
          // htmlContent,
        });
        console.log(`Email sent to ${user.email}`);
      } catch (error) {
        console.log(`Error sending email to ${user.email}: ${error.message}`);
      }
    });
  }
}
