export interface VendorBankAccountDto {
  id: string;
  vendor_id: string;
  currency_id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateVendorBankAccountDto {
  vendor_id: string;
  currency_id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_selected?: boolean;
}
export interface UpdateVendorBankAccountDto {
  vendor_id?: string;
  currency_id?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  is_selected?: boolean;
}
