import { Base } from '../../base.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Property } from 'src/properties/entities/property.entity';
import { Renter } from 'src/renters/entities/renters.entity';
import { Agreement } from 'src/agreements/entities/agreement.entity';
import { ColumnNumericTransformer } from '../../Utils/ColumnNumericTransformer';
import { LogisticalItem } from '../../logistical_items/entities/logistical_item.entity';
import {
  ExactFinanceInterface,
  OppFinanceInterface,
} from '../../exact-online/interfaces/exact.interface';
import { OppProvider } from '../../payment/entities/opp_provider.entity';

export enum PaymentStatus {
  PaymentProviderNotReady = 'error_payment_provider_not_ready',
  RenterNotFromProvider = 'error_renter_not_from_provider',
  Manual = 'manual',
  ManualActionNeeded = 'manual_action_needed',
  PlannedForSent = 'planned_for_sent',
  FailedToSent = 'failed_to_sent',
  Sent = 'sent',
  CREATED = 'opp_created',
  PENDING = 'opp_pending',
  PLANNED = 'opp_planned',
  COMPLETED = 'opp_completed',
  RESERVED = 'opp_reserved',
  CANCELLED = 'opp_cancelled',
  FAILED = 'opp_failed',
  EXPIRED = 'opp_expired',
  REFUNDED = 'opp_refunded',
  CHARGEBACK = 'opp_chargeback',
}

@Entity()
export class Finance extends Base {
  @Column()
  address: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ default: PaymentStatus.Manual })
  status: PaymentStatus;

  @Column({ default: '' })
  paymentMethod: string;

  @Column({ default: '' })
  transactionId: string;

  @Column({ default: '' })
  paymentUrl: string;

  @ManyToOne(() => Property, (property) => property.finances, { eager: true })
  public property: Property;

  @ManyToOne(() => Renter, (renter) => renter.id, { eager: true })
  public renter: Renter;

  @ManyToOne(() => Agreement, (agreement) => agreement.id, { eager: true })
  public agreement: Agreement;

  @ManyToOne(() => Tenant, (tenant) => tenant.user_roles, { eager: true })
  public tenant!: Tenant;

  @Column({ type: 'json', nullable: true })
  logisticalItems: LogisticalItem[];

  @Column({ type: 'json', nullable: true })
  exact: ExactFinanceInterface;

  @Column({ default: null })
  paidAt: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  openAmount: number;
}

// This interface is for returning a computed item based on the financial record, ledger record and mortgage record
export interface FinancialLedgerInterestItem {
  id: number;
  created_at: Date;
  property: Property;
  amount: number;
  exact?: ExactFinanceInterface;
  opp?: OppFinanceInterface;
  paymentUrl?: string;
  transactionId?: string;
  paymentMethod?: string;
  kind: 'Overeenkomst betaalverzoek' | 'Kasboek' | 'Hypotheek' | '';
  description: string;
  type: 'ledger' | 'finance' | 'mortgage';
  ledgerKind: string;
  status: string;
  mortgageType?: string;
}
