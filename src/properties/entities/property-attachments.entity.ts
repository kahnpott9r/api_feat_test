import { Renter } from 'src/renters/entities/renters.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Base } from '../../base.entity';
import { Property } from './property.entity';

export enum ATACHMENT_TYPE {
  IMAGE = 'image',
  FILE = 'file',
}

@Entity()
export class PropertyAttachment extends Base {
  @Column()
  url: string;

  @Column({
    default: '',
  })
  description: string;

  @Column({ default: ATACHMENT_TYPE.IMAGE })
  type: ATACHMENT_TYPE;

  @ManyToOne(() => Property, (property) => property.attachments) // specify inverse side as a second parameter
  property: Property;

  @ManyToOne(() => Renter, (renter) => renter.attachments) // specify inverse side as a second parameter
  renter: Renter;
}
