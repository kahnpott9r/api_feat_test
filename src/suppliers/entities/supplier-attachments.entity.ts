import { Column, Entity, ManyToOne } from 'typeorm';

import { Base } from '../../base.entity';
import { Supplier } from './suppliers.entity';
import { ATACHMENT_TYPE } from 'src/Utils/utils';

@Entity()
export class SupplierAttachment extends Base {
  @Column()
  url: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: 0 })
  size: number;

  @Column({ default: '' })
  mimeType: string;

  @Column({ default: ATACHMENT_TYPE.IMAGE })
  type: ATACHMENT_TYPE;

  @ManyToOne(() => Supplier, (supplier) => supplier.attachments, { onDelete: 'CASCADE' }) // specify inverse side as a second parameter
  supplier: Supplier;
}
