import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { Tenant } from '../../tenants/entities/tenant.entity';
import { Base } from '../../base.entity';
import { PropertyType } from './property_type.entity';
import { Agreement } from 'src/agreements/entities/agreement.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { NoteEntity } from './note.entity';
import { PropertyAttachment } from './property-attachments.entity';
import { PaymentRequest } from 'src/finance/entites/payment-request.entity';
import { Ledger } from 'src/finance/entites/ledger.entity';
import { Finance } from '../../finance/entites/finance.entity';
import { MortgageLine } from '../../mortgage_lines/entities/mortgage-line.entity';
import { ColumnNumericTransformer } from '../../Utils/ColumnNumericTransformer';
import { EnergyInsulation } from './energy-insulation.entity';
import { EarnEProperty } from '../../earn-e/entities/earn-e-property.entity';

export enum InsulationType {
  Floor = 'Floor',
  Cavity = 'Cavity',
  Facade = 'Facade',
  Roof = 'Roof',
  HRPlusPlusGlass = 'HRPlusPlusGlass',
  TripleGlass = 'TripleGlass',
}

@Entity()
export class Property extends Base {
  @Column({ default: null })
  description: string;

  @Column()
  country: string;
  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  zip_code: string;

  @Column()
  house_number: string;

  @Column()
  extension: string;

  @Column({ default: 0 })
  size: number;

  @Column({ default: 0 })
  plot_size: number;

  @Column({ default: 0 })
  rooms_number: number;

  @Column({ default: 0 })
  workroom_number: number;

  @Column({ default: 0 })
  bedroom_number: number;

  @Column({ default: 0 })
  bathroom_number: number;

  @Column({ default: 1990 })
  year: number;

  @Column({ default: '' })
  energy_level: string;

  @Column({ default: false })
  hasEarnE: boolean;

  @ManyToMany(
    () => EnergyInsulation,
    (energy_insulation) => energy_insulation.property,
    {
      eager: true,
    },
  )
  @JoinTable()
  energy_insulation: EnergyInsulation[];

  @Column({ default: '' })
  energy_heating: string;

  @OneToMany(() => NoteEntity, (note) => note.property, { cascade: true })
  notes: NoteEntity[];

  @ManyToOne(() => PropertyType, (type) => type.id)
  public type!: PropertyType;

  @OneToMany(() => Task, (task) => task.property, { cascade: true })
  public tasks: Task[];

  @OneToMany(() => Agreement, (agreement) => agreement.property, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  public agreements: Agreement[];

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { eager: true })
  public tenant!: Tenant;

  @OneToMany(() => PropertyAttachment, (attachment) => attachment.property, {
    cascade: true,
  })
  public attachments: PropertyAttachment[];

  @OneToMany(
    () => PaymentRequest,
    (paymentRequest) => paymentRequest.property,
    { cascade: true },
  )
  public paymentRequests: PaymentRequest[];

  @OneToMany(() => Ledger, (ledger) => ledger.property, { cascade: true })
  public ledgers: Ledger[];

  @OneToMany(() => Finance, (finance) => finance.property, { cascade: true })
  finances: Finance[];

  @OneToMany(() => MortgageLine, (mortgageLine) => mortgageLine.property, {
    eager: true,
    cascade: true,
  })
  mortgageLines: MortgageLine[];

  @OneToMany(() => EarnEProperty, (earnEProperty) => earnEProperty.property, {
    cascade: true,
  })
  earnEProperties: EarnEProperty[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  purchaseValue: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  marketValue: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  wozValue: number;

  @Column({
    default: null,
    nullable: true,
  })
  pairingCode: string;

  @Column({
    default: null,
    nullable: true,
  })
  energySupplier: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: null,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  energyCosts: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: null,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  gasCosts: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: null,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  networkManagementCosts: number;
}
