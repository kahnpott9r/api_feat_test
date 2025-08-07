import { Base } from 'src/base.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Task } from 'src/tasks/entities/task.entity';
import { SupplierAttachment } from './supplier-attachments.entity';
import { NoteEntity } from 'src/properties/entities/note.entity';

export enum SupplierType {
  PLUMBER = 0,
  ELECTRICIAN = 1,
  CLEANER = 2,
  GARDENER = 3,
  HVAC_SPECIALIST = 4,
  PEST_CONTROL = 5,
  WASTE_MANAGEMENT = 6,
  PAINTER = 7,
  GLAZIER = 8,
  CARPENTER = 9,
  OTHER = 10,
}

export enum SupplierStatus {
  ACTIVE = 0,
  INACTIVE = 1,
}

@Entity()
export class Supplier extends Base {
  @Column({ default: '' })
  company_name: string;

  @Column()
  phone: string;

  @Column()
  website: string;

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

  @Column({ default: null })
  iban: string;

  @Column({ type: 'int', default: null, nullable: true })
  hourly_rate: number; // stored in cents

  @Column({ type: 'json', default: null })
  contact: { 
    name: string;
    email: string;
  };

  @Column({ default: null })
  coc_number: string;

  @Column({ default: SupplierType.OTHER })
  type: SupplierType;

  @OneToMany(() => SupplierAttachment, (attachment) => attachment.supplier, {
    cascade: true,
  })
  public attachments: SupplierAttachment[];

  @OneToMany(() => NoteEntity, (note) => note.supplier, { cascade: true })
  public notes: NoteEntity[];

  @OneToMany(() => Task, (task) => task.supplier, {
    cascade: true,
  })
  public tasks: Task[];

  @Column({ default: SupplierStatus.ACTIVE })
  status: SupplierStatus;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { eager: true })
  public tenant!: Tenant;
}
