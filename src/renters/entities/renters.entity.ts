import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Tenant, TENANT_TYPE } from '../../tenants/entities/tenant.entity';
import { Base } from '../../base.entity';
import { Agreement } from '../../agreements/entities/agreement.entity';
import { LogisticalItem } from 'src/logistical_items/entities/logistical_item.entity';
import { PropertyAttachment } from 'src/properties/entities/property-attachments.entity';
import { NoteEntity } from 'src/properties/entities/note.entity';
export enum RENTER_TYPE {
  CONSUMER = 'Consumer',
  BUSINESS = 'Business',
}

export enum GENDERS {
  FEMALE = 'Female',
  MALE = 'Male',
  DIFFERENT = 'different/i prefer not to say',
}

@Entity()
export class Renter extends Base {
  @Column()
  first_name: string;

  @Column({ default: '' })
  last_name: string;

  @Column({ default: '' })
  avatar: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ default: GENDERS.MALE })
  gender: GENDERS;

  @Column()
  invoice_email: string;

  @Column()
  invoice_street: string;

  @Column()
  invoice_housenumber: string;

  @Column()
  invoice_extensions: string;

  @Column()
  invoice_zipcode: string;

  @Column()
  invoice_city: string;

  @Column({ default: RENTER_TYPE.CONSUMER })
  type: RENTER_TYPE;

  @Column({ default: '' })
  iban: string;

  @Column({ default: null })
  company_name: string;

  @Column({ default: null })
  birth_day: string;

  @Column({ default: null })
  kvk: string;

  @Column({ default: null })
  tax_id: string;

  @OneToMany(() => PropertyAttachment, (attachment) => attachment.renter, {
    cascade: true,
  })
  public attachments: PropertyAttachment[];

  @OneToMany(() => NoteEntity, (note) => note.renter, { cascade: true })
  public notes: NoteEntity[];

  @ManyToMany(() => Agreement, (agreement) => agreement.renters)
  public agreements: Agreement[];

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { eager: true })
  public tenant!: Tenant;

  @ManyToOne(
    () => LogisticalItem,
    (logistical_item) => logistical_item.renters,
    { cascade: true },
  )
  public logistical_items!: LogisticalItem[];

  @Column({ default: null })
  exactId: null | string;
}
