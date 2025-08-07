import { Base } from '../../base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Property } from '../../properties/entities/property.entity';
import { ColumnNumericTransformer } from '../../Utils/ColumnNumericTransformer';
import { Exclude } from 'class-transformer';

export enum Kind {
  REVENUES = 'Revenues',
  COST = 'Cost',
}

export enum Duration {
  PeriodicUnKnown = 'PeriodicUnKnown',
  PeriodicKnown = 'PeriodicKnown',
  OneTime = 'OneTime',
}

@Entity()
export class Ledger extends Base {
  @Column({ default: Kind.REVENUES })
  kind: Kind;

  @Column({ default: Duration.PeriodicUnKnown })
  duration: Duration;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ default: null })
  startDate: Date;

  @Column({ default: null })
  endDate: Date;

  @Column({ default: null })
  description: string;

  @Column({ default: null, nullable: true })
  thirdPartyReference?: string;

  @Column({ default: null, nullable: true })
  mortgageType?: string;

  @ManyToOne(() => Property, (property) => property.ledgers)
  public property: Property;

  @ManyToOne(() => Tenant, (tenant) => tenant.user_roles, { eager: true })
  public tenant!: Tenant;
}
