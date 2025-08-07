export interface ExactReceivableInterface {
  ID: string;
  AccountCode: string;
  AccountName: string;
  AccountContactName: string;
  AmountDC: string;
  TransactionAmountDC: string;
  Status: number;
  DueDate: string;
  PaymentMethod: string;
  InvoiceDate: string;
  InvoiceNumber: string | number;
  Journal: string;
  JournalDescription: string;
  GLAccountCode: string;
  GLAccountDescription: string;
}
