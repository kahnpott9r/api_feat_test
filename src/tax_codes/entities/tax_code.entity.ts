import { Base } from '../../base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { LogisticalItem } from 'src/logistical_items/entities/logistical_item.entity';
import { ColumnNumericTransformer } from '../../Utils/ColumnNumericTransformer';

@Entity()
export class TaxCode extends Base {
  @Column()
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  percentage: number;

  @OneToMany(
    () => LogisticalItem,
    (logistical_item) => logistical_item.tax_code,
    { cascade: true },
  )
  public logistical_items!: LogisticalItem[];
}
