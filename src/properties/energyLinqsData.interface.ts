import { Property } from './entities/property.entity';

export interface EnergyData {
  energyDeliveredTariff1: number;
  energyDeliveredTariff2: number;
  energyReturnedTariff1: number;
  energyReturnedTariff2: number;
  gasDelivered: number;
  energyDeliveredTariff1Difference: number;
  energyDeliveredTariff2Difference: number;
  energyReturnedTariff1Difference: number;
  energyReturnedTariff2Difference: number;
  gasDeliveredDifference: number;
  powerDelivered: number;
  powerReturned: number;
}

export interface EnergyDataInterval extends EnergyData {
  energyCosts: number;
  gasCosts: number;
}

export interface EnergyDataPeriod extends EnergyData {
  date: string;
  totalPowerDelivered: number;
  totalPowerReturned: number;
  energyCosts: number;
  gasCosts: number;
  totalEnergyCosts: number;
  totalGasCosts: number;
  intervalEnergyDeliveredDifference: number;
  intervalEnergyReturnedDifference: number;
  intervalGasDeliveredDifference: number;
  intervalPowerDelivered: number;
  intervalPowerReturned: number;
  intervalEnergyCosts: number;
  intervalGasCosts: number;
}

export interface EnergyDataTotal extends EnergyData {
  totalPowerDelivered: number;
  totalPowerReturned: number;
  totalEnergyCosts: number;
  totalGasCosts: number;
  intervalEnergyDeliveredDifference: number;
  intervalEnergyReturnedDifference: number;
  intervalGasDeliveredDifference: number;
  intervalPowerDelivered: number;
  intervalPowerReturned: number;
  intervalEnergyCosts: number;
  intervalGasCosts: number;
  energyCosts: number;
  gasCosts: number;
}

export interface PropertyData {
  property: Property;
  interval: EnergyDataInterval;
  periods: EnergyDataPeriod[];
}

export interface AggregatedEarnEData {
  global: EnergyDataTotal & {
    periods: EnergyDataPeriod[];
  };
  properties: PropertyData[];
}

export interface EnergyLinqsData {
  date: string;
  energyDeliveredTotal: number;
  energyReturnedTotal: number;
  gasDeliveredTotal: number;
  energyCostsTotal: number;
  gasCostsTotal: number;
  energyCosts: number;
  gasCosts: number;
  intervalEnergyDelivered: number;
  intervalEnergyReturned: number;
  intervalGasDelivered: number;
}
