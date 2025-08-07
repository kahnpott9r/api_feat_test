import { Base } from '../../base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { AgreementStatus } from '../../agreements/entities/agreement.entity';
export enum BankStatus {
  new = 'new',
  pending = 'pending',
  approved = 'approved',
  disapproved = 'disapproved',
}

export enum ContactStatus {
  unverified = 'unverified',
  pending = 'pending',
  verified = 'verified',
}
@Entity()
export class OppProvider extends Base {
  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  chamber_number: string;

  @Column()
  vat_number: string;

  @Column()
  country: string;

  @Column({ default: null })
  merchantId: string;

  @Column({ default: '' })
  merchantStatus: string;

  @Column({ default: '' })
  merchantType: string;

  @Column({ default: '' })
  complianceStatus: string;

  @Column({ default: 0 })
  complianceLevel: number;

  @Column({ default: '' })
  complianceOverviewUrl: string;

  @Column({ default: '' })
  bankId: string;

  @Column({ default: '' })
  bankVerifyUrl: string;

  @Column({ default: BankStatus.new })
  bankStatus: BankStatus;

  @Column({ default: '' })
  contactId: string;

  @Column({ default: '' })
  contactVerifyUrl: string;

  @Column({ default: ContactStatus.unverified })
  contactStatus: ContactStatus;

  @OneToOne(() => Tenant, (tenant) => tenant.opp_payment)
  @JoinColumn()
  tenant: Tenant;
}
