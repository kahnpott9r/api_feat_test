export interface VatCodesInterface {
  __metadata: {
    uri: string;
    type: string;
  };
  Account: string;
  AccountCode: null;
  AccountName: string;
  CalculationBasis: number;
  Charged: boolean;
  Code: string;
  Country: null;
  Description: string;
  EUSalesListing: string;
  GLDiscountPurchase: null;
  GLDiscountPurchaseCode: null;
  GLDiscountPurchaseDescription: null;
  GLDiscountSales: null;
  GLDiscountSalesCode: null;
  GLDiscountSalesDescription: null;
  GLToClaim: string;
  GLToClaimCode: string;
  GLToClaimDescription: string;
  GLToPay: string;
  GLToPayCode: string;
  GLToPayDescription: string;
  ID: string;
  IntraStat: boolean;
  IsBlocked: boolean;
  LegalText: null;
  Percentage: number;
  TaxReturnType: null;
  Type: string;
  VatDocType: string;
  VatMargin: number;
  VATPartialRatio: null;
  VATPercentages: {
    __deferred: {
      uri: string;
    };
  };
  VATTransactionType: string;
}

export interface ReceivablesList {
  __metadata: {
    uri: string;
    type: string;
  };
  HID: number;
  Id: string;
  AccountCode: string;
  AccountId: string;
  AccountName: string;
  Amount: number;
  AmountInTransit: number;
  CurrencyCode: string;
  Description: string;
  DueDate: string;
  EntryNumber: number;
  InvoiceDate: string;
  InvoiceNumber: number;
  JournalCode: string;
  JournalDescription: string;
  YourRef: string | null;
}
export interface VatCodesResponseInterface {
  d: {
    results: VatCodesInterface[];
  };
}

export interface ReceivablesListInterface {
  d: {
    results: ReceivablesList[];
  };
}

export interface ExactVatCodesInterface {
  id: string;
  name: string;
  code: string;
  Percentage: number;
}
export interface MappedVatCodes {
  [key: number]: string;
}
