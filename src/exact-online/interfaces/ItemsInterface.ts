import { LOGISTICAL_TYPE } from '../../logistical_items/entities/logistical_item.entity';
import { AccountInterface } from './AccountInterface';

export interface ItemsInterface {
  [LOGISTICAL_TYPE.RENT]: string;
  [LOGISTICAL_TYPE.DEPOSIT]: string;
  [LOGISTICAL_TYPE.SERVICE_FEE]: string;
  [LOGISTICAL_TYPE.OHTER]: string;
}

export interface CreateExactItemInterface {
  Code: string;
  Description: string;
  IsSalesItem: true;
  SalesVatCode?: string;
  CostPriceCurrency: 'EUR';
  CostPriceNew?: number;
  CostPriceStandard?: number;
}

export interface ExactItemResponseInterface {
  d: ExactItem;
}

export interface ExactItem {
  __metadata: {
    uri: string;
    type: string;
  };
  IsSerialNumberItem: null | boolean;
  IsBatchNumberItem: number;
  Class_01: null;
  Class_02: null;
  Class_03: null;
  Class_04: null;
  Class_05: null;
  Code: null;
  CopyRemarks: number;
  CostPriceCurrency: null;
  CostPriceNew: null;
  CostPriceStandard: null;
  Description: null;
  EndDate: null;
  ExtraDescription: null;
  GLCostsCode: null;
  GLCostsDescription: null;
  GLCosts: null;
  GLRevenueCode: null;
  GLRevenueDescription: null;
  GLRevenue: null;
  GLStockCode: null;
  GLStockDescription: null;
  GLStock: null;
  ID: string;
  IsBatchItem: number;
  IsFractionAllowedItem: null;
  IsMakeItem: number;
  IsNewContract: number;
  IsOnDemandItem: number;
  IsPackageItem: null;
  IsPurchaseItem: null;
  IsRegistrationCodeItem: number;
  IsSalesItem: null;
  IsSerialItem: null;
  IsStockItem: null;
  IsSubcontractedItem: null;
  IsTime: number;
  IsWebshopItem: number;
  ItemGroupCode: null;
  ItemGroupDescription: null;
  ItemGroup: null;
  NetWeight: null;
  Notes: null;
  PictureName: null;
  SalesVatCodeDescription: null;
  SalesVatCode: null;
  SearchCode: null;
  SecurityLevel: null;
  StartDate: null;
  Unit: null;
  UnitDescription: null;
  UnitType: null;
}

export interface PartialExactItem {
  Code: string;
  ID: string;
  Descrption: string;
}
export interface ExactPartialItemResponseInterface {
  d: {
    results: PartialExactItem[];
  };
}
