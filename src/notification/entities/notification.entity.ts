import { Base } from 'src/base.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum NotificationType {
  PAYMENT = 'Payment',
  NORMAN = 'Normal',
}

@Entity()
export class Notification extends Base {
  @Column()
  title: string;

  @Column({ default: null })
  description: string;

  @Column({ default: null })
  url: string;

  @Column({ default: NotificationType.NORMAN })
  type: NotificationType;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { eager: true })
  public tenant!: Tenant;
}
