import { Base } from '../../base.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Property } from '../../properties/entities/property.entity';
import { ColumnNumericTransformer } from '../../Utils/ColumnNumericTransformer';

@Entity()
export class PaymentRequest extends Base {
  @Column({ default: false })
  is_auto: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @ManyToOne(() => Property, (property) => property.paymentRequests)
  public property!: Property;

  @ManyToOne(() => Tenant, (tenant) => tenant.user_roles)
  public tenant!: Tenant;
}
