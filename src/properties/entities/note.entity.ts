import { Renter } from 'src/renters/entities/renters.entity';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Base } from '../../base.entity';
import { Property } from './property.entity';

@Entity()
export class NoteEntity extends Base {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => Property, (property) => property.notes) // specify inverse side as a second parameter
  property: Property;

  @ManyToOne(() => Renter, (renter) => renter.notes) // specify inverse side as a second parameter
  renter: Renter;

  @ManyToOne(() => Supplier, (supplier) => supplier.notes) // specify inverse side as a second parameter
  supplier: Supplier;

  @Column('jsonb', { nullable: true })
  history: {
    timestamp: string;
    type?: 'created';
    changes?: Array<{
      type: 'name' | 'description';
      old: string;
      new: string;
    }>;
  }[];
}
