import { PaymentStatus } from 'src/finance/entites/finance.entity';

export interface ResponseCreateTransaction {
  uid: string;
  merchant_uid: string;
  statuses: TransactionStatusType;
  redirect_url: string;
}

export interface TransactionStatusType {
  uid: string;
  status: PaymentStatus;
}

export enum TransactionStatus {
  Created = 'created',
}
