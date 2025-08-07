import { Entity, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Base } from '../../base.entity';

@Entity()
export class EarnEProperty extends Base {
  @Column()
  swVersion: number;

  @Column()
  deviceId: string;

  @Column('json')
  geo: {
    lat: string;
    lon: string;
  };

  @Column()
  model: string;

  @Column()
  wifiRSSI: number;

  @Column('decimal', { precision: 12, scale: 6 })
  energyDeliveredTariff1: number;

  @Column('decimal', { precision: 12, scale: 6 })
  energyDeliveredTariff2: number;

  @Column('decimal', { precision: 12, scale: 6 })
  energyReturnedTariff1: number;

  @Column('decimal', { precision: 12, scale: 6 })
  energyReturnedTariff2: number;

  @Column('decimal', { precision: 12, scale: 6 })
  gasDelivered: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  energyDeliveredTariff1Difference: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  energyDeliveredTariff2Difference: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  energyReturnedTariff1Difference: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  energyReturnedTariff2Difference: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  gasDeliveredDifference: number;

  @Column('decimal', { precision: 12, scale: 6 })
  powerDelivered: number;

  @Column('decimal', { precision: 12, scale: 6 })
  powerReturned: number;

  @Column('decimal', { precision: 12, scale: 6 })
  voltageL1: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  voltageL2: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  voltageL3: number;

  @Column('decimal', { precision: 12, scale: 6 })
  currentL1: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  currentL2: number;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  currentL3: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Property, (property) => property.earnEProperties)
  property: Property;
}
