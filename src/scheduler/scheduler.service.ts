import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AgreementsService } from 'src/agreements/agreements.service';
import { PaymentService } from 'src/payment/payment.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Agreement } from '../agreements/entities/agreement.entity';
import { TasksService } from '../tasks/tasks.service';
import { ExactOnlineService } from '../exact-online/exact-online.service';
import { FinanceService } from '../finance/finance.service';
import { MortgageLine } from '../mortgage_lines/entities/mortgage-line.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private agreementService: AgreementsService,
    private paymentService: PaymentService,
    private exactOnlineService: ExactOnlineService,
    private tasksService: TasksService,
    private financeService: FinanceService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    this.paymentService.processAllAgreements().then();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleExact() {
    this.exactOnlineService.syncOpenInvoices().then();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateTasks() {
    this.logger.warn('Updating tasks');
    await this.tasksService.updateExpiredOpenTasks();
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async updateMortgageInterest() {
    this.logger.warn('Updating mortgage interest');
    await this.financeService.updateAllMortgageInterests();
  }

  @OnEvent('mortgage-line.insert')
  async handleMortgageLineCreated(mortgageLine: MortgageLine) {
    console.log('Mortgage line insert called with ID:', mortgageLine.id);
    await this.financeService.updateMortgageInterests(mortgageLine);
  }
  @OnEvent('agreement.insert')
  async handleAgreementsCreated(agreement: Agreement) {
    console.log('Agreement insert called with ID:', agreement.id);
    
    const insertAgreement = await this.agreementService.getAgreementsRelational(
      agreement.id,
    );
    
    if (!insertAgreement) {
      console.log('No agreement found');
      return;
    }
    
    console.log('Agreement found with logistical_items count:', insertAgreement.logistical_items?.length || 0);
    console.log('Logistical items:', JSON.stringify(insertAgreement.logistical_items, null, 2));
    
    if (!insertAgreement.logistical_items || insertAgreement.logistical_items.length === 0) {
      console.log('No logistical items found, skipping payment processing');
      return;
    }
    
    const primaryRenter = insertAgreement.primaryRenter;
    const tenant = insertAgreement.tenant;
    const property = insertAgreement.property;
    await this.paymentService.processPaymentForAgreement(
      tenant,
      primaryRenter,
      property,
      insertAgreement,
    );
  }
}
