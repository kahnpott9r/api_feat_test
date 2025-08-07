import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinanceService } from 'src/finance/finance.service';
import {
  Notification,
  NotificationType,
} from 'src/notification/entities/notification.entity';
import { OppProvider } from 'src/payment/entities/opp_provider.entity';
import {
  NotificationData,
  NotificationObject,
  NotificationMerchantResponse,
  NotificationTransactionResponse,
  BankAccountResponse,
  ContactResponse,
  MerchantWithContact,
} from 'src/payment/OPPResponse/Compliance';
import { WebRequestService } from 'src/Utils/WebRequestService';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentNotifyService {
  private readonly logger = new Logger(PaymentNotifyService.name);

  constructor(
    private webRequestService: WebRequestService,
    private financeService: FinanceService,
    @InjectRepository(OppProvider)
    private OppProviderRepository: Repository<OppProvider>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async ProcessNotification(data: NotificationData) {
    this.logger.warn('Notification:', data);
    if (data.object_type == NotificationObject.Merchant) {
      const result: MerchantWithContact =
        await this.webRequestService.sendGetRequest(data.object_url);
      if (result.compliance) {
        const paymentEntity = await this.OppProviderRepository.findOne({
          where: {
            merchantId: result.uid,
          },
          relations: ['tenant'],
        });
        if (!paymentEntity) {
          this.logger.warn('OPP not found');
          return;
        }
        console.log('result', result);
        paymentEntity.merchantStatus = result.status;
        paymentEntity.complianceLevel = result.compliance.level;
        paymentEntity.complianceStatus = result.compliance.status;
        paymentEntity.complianceOverviewUrl = result.compliance.overview_url;

        await this.OppProviderRepository.save(paymentEntity);
      }
    } else if (data.object_type == NotificationObject.Transaction) {
      const result: NotificationTransactionResponse =
        await this.webRequestService.sendGetRequest(data.object_url);
      await this.financeService.updatePaymentStatus(result);
    } else if (data.object_type == NotificationObject.BankAccount) {
      const result: BankAccountResponse =
        await this.webRequestService.sendGetRequest(data.object_url);
      const OPP = await this.OppProviderRepository.findOne({
        where: {
          bankId: result.uid,
        },
      });
      if (!OPP) {
        this.logger.warn('OPP bank not found');
        return;
      }
      console.log('bank result', result);
      OPP.bankStatus = result.status;
      OPP.bankVerifyUrl = result.verification_url;
      await this.OppProviderRepository.save(OPP);
    } else if (data.object_type == NotificationObject.Contact) {
      const result: ContactResponse =
        await this.webRequestService.sendGetRequest(data.object_url);
      const OPP = await this.OppProviderRepository.findOne({
        where: {
          contactId: result.uid,
        },
      });
      if (!OPP) {
        this.logger.warn('OPP contact not found');
        return;
      }
      console.log('contact result', result);
      OPP.contactStatus = result.status;
      OPP.contactVerifyUrl = result.verification_url;
      await this.OppProviderRepository.save(OPP);
    }
  }
}
