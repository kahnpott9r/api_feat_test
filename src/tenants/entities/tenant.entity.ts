import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { Base } from '../../base.entity';
import { UserRole } from '../../user_roles/entities/user_role.entity';
import { OppProvider } from '../../payment/entities/opp_provider.entity';
import { LogisticalItem } from '../../logistical_items/entities/logistical_item.entity';
import { StorageInterface } from '../../exact-online/interfaces/StorageInterface';
import { Exclude, Expose } from 'class-transformer';
import { Finance } from '../../finance/entites/finance.entity';

export enum TENANT_TYPE {
  CONSUMER = 'Consumer',
  BUSINESS = 'Business',
}

@Entity()
export class Tenant extends Base {
  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    default: '',
  })
  email: string;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({ default: TENANT_TYPE.CONSUMER })
  type: TENANT_TYPE;

  @OneToMany(() => UserRole, (user_role) => user_role.tenant, { cascade: true })
  public user_roles!: UserRole[];

  @OneToMany(() => Finance, (finance) => finance.tenant)
  public finances!: Finance[];

  @OneToOne(() => OppProvider, (opp_payment) => opp_payment.tenant, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  opp_payment: OppProvider;

  @OneToMany(
    () => LogisticalItem,
    (logistical_item) => logistical_item.tenant,
    { cascade: true },
  )
  public logistical_items!: LogisticalItem[];

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  mobile: string;

  @Column({ default: '' })
  street: string;

  @Column({ default: '' })
  housenumber: string;

  @Column({ default: '' })
  extensions: string;

  @Column({ default: '' })
  zipcode: string;

  @Column({ default: '' })
  city: string;

  @Column({ default: '' })
  iban: string;

  @Column({ default: '' })
  kvk: string;

  @Column({ default: '' })
  tax_id: string;

  @Column({ default: false })
  hasEarnE: boolean;

  @Exclude()
  @Column({
    type: 'jsonb', // json is default, jsonb is better.
    nullable: true,
  })
  public exact_storage: null | Map<string, string>;

  getStorageWrapper(): StorageInterface {
    return {
      get: async (key) => {
        await this.reload();
        return this.exact_storage ? this.exact_storage[key] : null;
      },
      set: async (key, value) => {
        if (!this.exact_storage) {
          this.exact_storage = new Map<string, string>();
        }
        this.exact_storage[key] = value;
        await this.save();
      },
      clear: async () => {
        this.exact_storage = null;
        await this.save();
      },
    };
  }

  @Expose() // Explicitly include the calculated field in serialization
  public hasExactOnline(): boolean {
    return !!this.exact_storage?.['division'];
  }
}
