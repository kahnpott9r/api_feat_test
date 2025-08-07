import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../base.entity';
import { ColumnNumericTransformer } from '../../Utils/ColumnNumericTransformer';
import { Property } from '../../properties/entities/property.entity';

export enum Type {
  ANNUITY = 'Annuity',
  LINEAR = 'Linear',
}

@Entity()
export class MortgageLine extends Base {
  @Column({
    default: null,
  })
  startDate: Date;

  @Column({
    default: null,
  })
  endDate: Date;

  @Column({
    default: Type.ANNUITY,
  })
  type: Type;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  interestRate: number;

  @Column({
    default: null,
  })
  duration: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: null,
    transformer: new ColumnNumericTransformer(),
  })
  monthlyPayment: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  accumulatedAmount: number;

  @Column({
    default: null,
  })
  part: number;

  @ManyToOne(() => Property, (property) => property.mortgageLines)
  public property: Property;
}

export interface MortgageDetails {
  durationMonths: number;
  monthlyPayment: number;
  accumulatedAmount: number;
  remainingAmount: number;
  principalRepayment: number;
  interestPayment: number;
  monthsPassed: number;
  month: number;
}
