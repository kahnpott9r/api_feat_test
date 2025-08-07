import { VatCodesInterface } from './VatCodesInterface';

export interface SalesInvoiceInterface {
  ID?: string;
  AmountDC?: number;
  AmountFC?: number;
  CostCenter?: string;
  CostCenterDescription?: string;
  CostUnit?: string;
  CostUnitDescription?: string;
  CustomerItemCode?: string;
  CustomField?: string;
  DeliveryDate?: Date;
  Description?: string;
  Discount?: number;
  Division?: number;
  Employee?: string;
  EmployeeFullName?: string;
  EndTime?: Date;
  ExtraDutyAmountFC?: number;
  ExtraDutyPercentage?: number;
  GLAccount?: string;
  GLAccountDescription?: string;
  InvoiceID?: string;
  Item?: string;
  ItemCode?: string;
  ItemDescription?: string;
  LineNumber?: number;
  NetPrice?: number;
  Notes?: string;
  Pricelist?: string;
  PricelistDescription?: string;
  Project?: string;
  ProjectDescription?: string;
  ProjectWBS?: string;
  ProjectWBSDescription?: string;
  Quantity?: number;
  SalesOrder?: string;
  SalesOrderLine?: string;
  SalesOrderLineNumber?: number;
  SalesOrderNumber?: number;
  StartTime?: Date;
  Subscription?: string;
  SubscriptionDescription?: string;
  TaxSchedule?: string;
  TaxScheduleCode?: string;
  TaxScheduleDescription?: string;
  UnitCode?: string;
  UnitDescription?: string;
  UnitPrice?: number;
  VATAmountDC?: number;
  VATAmountFC?: number;
}

interface SalesInvoiceResponseItem {
  AmountFC: number;
  AmountDiscount: number;
  AmountDC: number;
  AmountDiscountExclVat: number;
  AmountFCExclVat: number;
  Created: string;
  Creator: string;
  CreatorFullName: string;
  Currency: string;
  DeliverTo: string;
  DeliverToContactPerson: null | string;
  DeliverToContactPersonFullName: null | string;
  DeliverToAddress: string;
  DeliverToName: string;
  Description: null | string;
  Discount: number;
  DiscountType: number;
  Division: number;
  Document: null | string;
  DocumentNumber: null | string;
  DocumentSubject: null | string;
  DueDate: string;
  ExtraDutyAmountFC: null | number;
  GAccountAmountFC: null | number;
  IncotermAddress: null | string;
  IncotermCode: null | string;
  IncotermVersion: null | string;
  InvoiceDate: string;
  InvoiceID: string;
  InvoiceTo: string;
  InvoiceToContactPerson: null | string;
  InvoiceToContactPersonFullName: null | string;
  InvoiceToName: string;
  InvoiceNumber: null | string;
  IsExtraDuty: null | boolean;
  Journal: string;
  JournalDescription: string;
  Modified: string;
  Modifier: string;
  ModifierFullName: string;
  OrderDate: string;
  OrderedBy: string;
  OrderedByContactPerson: null | string;
  OrderedByContactPersonFullName: null | string;
  OrderedByName: string;
  OrderNumber: number;
  PaymentCondition: string;
  PaymentConditionDescription: string;
  PaymentReference: null | string;
  Remarks: null | string;
  SalesChannel: null | string;
  SalesChannelCode: null | string;
  SalesChannelDescription: null | string;
  Salesperson: string;
  SalespersonFullName: string;
  SelectionCode: null | string;
  SelectionCodeCode: null | string;
  SelectionCodeDescription: null | string;
  ShippingMethod: null | string;
  ShippingMethodCode: null | string;
  ShippingMethodDescription: null | string;
  Status: number;
  StatusDescription: string;
  TaxSchedule: null | string;
  TaxScheduleCode: null | string;
  TaxScheduleDescription: null | string;
  Type: number;
  TypeDescription: string;
  VATAmountFC: number;
  VATAmountDC: null | number;
  YourRef: null | string;
  SalesInvoiceLines: {
    __deferred: object;
  };
  SalesInvoiceOrderChargeLines: {
    __deferred: object;
  };
  StarterSalesInvoiceStatus: null | string;
  StarterSalesInvoiceStatusDescription: null | string;
  WithholdingTaxAmountFC: null | number;
  WithholdingTaxBaseAmount: null | number;
  WithholdingTaxPercentage: null | number;
  Warehouse: null | string;
}
export interface SalesInvoiceResponseInterface {
  d: SalesInvoiceResponseItem;
}

export interface SalesInvoiceLine {
  Item: string;
  Quantity: number;
  UnitPrice: number;
  VATCode: string;
  Description?: string;
}

export interface SalesInvoice {
  OrderedBy: string;
  SalesInvoiceLines: SalesInvoiceLine[];
}
