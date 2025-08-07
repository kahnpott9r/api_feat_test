import { PaymentStatus } from 'src/finance/entites/finance.entity';
import { BankStatus, ContactStatus } from '../entities/opp_provider.entity';
export enum TransactionStatus {
  CREATED = 'created',
  PENDING = 'pending',
  PLANNED = 'planned',
  COMPLETED = 'completed',
  RESERVED = 'reserved',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
  CHARGEBACK = 'chargeback',
}

export interface Compliance {
  level: number;
  status: Compliance_Status;
  overview_url: string;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  type: string;
  status: string;
  object_type: string;
  object_url: string;
  object_redirect_url: string;
}

export interface NotificationData {
  uid: string;
  type: string;
  object_uid: string;
  object_type: string;
  object_url: string;
}

export interface MerchantWithContact {
  livemode: boolean;
  uid: string;
  object: 'merchant';
  created: number;
  updated: number;
  status: string; // You might consider creating a custom enum for the possible merchant statuses
  compliance: Compliance;
  type: string; // You might consider creating a custom enum for the possible merchant types
  coc_nr: null | string;
  name: string;
  phone: string;
  vat_nr: null | string;
  country: string;
  sector: null | string;
  trading_names: string[];
  payment_methods: string[];
  notify_url: string;
  return_url: string;
  metadata: any[];
  // ... other properties
  contacts: Contact[];
  // ... other properties
}

export interface Contact {
  uid: string;
  object: 'contact';
  created: number;
  updated: number;
  verified: null | boolean;
  status: string; // You might consider creating a custom enum for the possible contact statuses
  verification_url: string;
  type: string; // You might consider creating a custom enum for the possible contact types
  title: null | string;
  name_initials: null | string;
  name_first: null | string;
  name_last: null | string;
  names_given: null | string;
  birthdate: null | string;
  partner_name_last: null | string;
}

export interface NotificationMerchantResponse {
  uid: string;
  object: string;
  compliance: Compliance;
  type: string;
}

export interface NotificationTransactionResponse {
  uid: string;
  object: 'transaction';
  created: number;
  updated: number;
  completed: null | number;
  merchant_uid: string;
  profile_uid: string;
  has_checkout: boolean;
  payment_method: null | string;
  payment_flow: string;
  payment_details: any[]; // Replace `any` with the specific type for payment details if available
  amount: number;
  return_url: string;
  redirect_url: string;
  notify_url: string;
  status: PaymentStatus; // You might consider creating a custom enum for the possible transaction statuses
  metadata: MetadataItem[];
  statuses: Status[];
  order: any[]; // Replace `any` with the specific type for the order if available
  escrow: null | any; // Replace `any` with the specific type for escrow if available
  fees: any; // Replace `any` with the specific type for fees if available
  refunds: any; // Replace `any` with the specific type for refunds if available
}

export interface MetadataItem {
  key: string;
  value: any; // Replace `any` with the specific type for the metadata value if available
}

export interface Status {
  uid: string;
  object: 'status';
  created: number;
  updated: number;
  status: string; // You might consider creating a custom enum for the possible status values
}

export interface ContactResponse {
  uid: string;
  object: 'contact';
  created: number;
  updated: number;
  verified: null | boolean;
  verified_with: null | string;
  status: ContactStatus; // You might consider creating a custom enum for the possible contact statuses
  verification_url: string;
  type: string; // You might consider creating a custom enum for the possible contact types
  title: string | null;
  name_initials: string | null;
  name_first: string | null;
  name_last: string | null;
  names_given: string | null;
  birthdate: number | null;
  partner_name_last: number | null;
}

export interface BankAccountResponse {
  uid: string;
  object: 'bank_account';
  created: number;
  updated: number;
  verified: null | boolean;
  verified_with: null | string;
  verification_url: string;
  status: BankStatus;
  account: {
    account_iban: null | string;
  };
  bank: {
    bic: null | string;
  };
  reference: null | string;
  return_url: string;
  notify_url: string;
  is_default: boolean;
}

export enum Compliance_Request {
  Compliance_Status = 'merchant.compliance_status.changed',
  Compliance_Level = 'merchant.compliance_level.changed',
}

export enum NotificationObject {
  Merchant = 'merchant',
  Transaction = 'transaction',
  BankAccount = 'bank_account',
  Contact = 'contact',
}

export enum Compliance_Status {
  Unverified = 'unverified',
  Pending = 'pending',
  verified = 'verified',
}

export enum Transactioin_Status {
  Created = 'created',
  Pending = 'pending',
  Expired = 'expired',
  Canceled = 'cancelled',
  Failed = 'failed',
  Planned = 'planned',
  Reserved = 'reserved',
  Completed = 'completed',
}
