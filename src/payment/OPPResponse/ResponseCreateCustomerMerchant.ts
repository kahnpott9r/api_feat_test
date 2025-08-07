import { Compliance } from './Compliance';

export interface ResponseCreateCustomerMerchant {
  uid: string;
  status: string;
  compliance: Compliance;
  type: string;
  phone: string;
  vat_nr: string;
  country: string;
  notify_url: string;
}
