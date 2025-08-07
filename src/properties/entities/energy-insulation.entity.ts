import { Column, Entity, ManyToMany } from 'typeorm';

import { Base } from '../../base.entity';
import { Property } from './property.entity';

@Entity()
export class EnergyInsulation extends Base {
  @Column()
  name: string;

  @ManyToMany(() => Property, (property) => property.energy_insulation)
  property: Property[];
}
