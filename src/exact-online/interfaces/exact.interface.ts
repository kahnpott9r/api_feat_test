export interface ExactFinanceInterface {
  id: string;
  invoice: number;
}

export interface OppFinanceInterface {
  transactionId: string;
  paymentMethod: string;
  paymentUrl: string;
}
