export interface ExactPaymentInterface {
  ID: string;
  AccountCode: string;
  AccountName: string;
  AccountContactName: string;
  AmountDC: string;
  TransactionAmountDC: string;
  Status: number;
  PaymentMethod: string;
  DueDate: string;
  InvoiceDate: string;
  InvoiceNumber: string | number;
  Journal: string;
  JournalDescription: string;
  GLAccountCode: string;
  GLAccountDescription: string;
  Description: string;
}
