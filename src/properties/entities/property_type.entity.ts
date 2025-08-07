import { Column, Entity } from 'typeorm';

import { Base } from '../../base.entity';

@Entity()
export class PropertyType extends Base {
  @Column()
  name: string;
}
