import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
  ) {
    console.log(configService.get('SEND_GRID_KEY'));
    sgMail.setApiKey(configService.get('SEND_GRID_KEY'));
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    dynamicData: any,
    templateId: string,
    replyTo?: string,
  ) {
    const adminEmail = this.configService.get('SEND_GRID_FROM');
    const msg: sgMail.MailDataRequired = {
      to: to,
      from: adminEmail,
      templateId: templateId,
      dynamicTemplateData: dynamicData,
    };

    // Add reply-to if provided
    if (replyTo) {
      msg.replyTo = replyTo;
    }

    return await sgMail
      .send(msg)
      .then((r) => true)
      .catch((e) => {
        console.log(e);
        console.log(JSON.stringify(e?.response?.body?.errors));
        return false;
      });
  }
}
