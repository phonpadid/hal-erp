import type { CurrencyApiModel } from "./currency.interface";

export interface ExchangeRateApiModel {
  id: string;
  from_currency_id: number;
  to_currency_id: number;
  rate: number;
  is_active?: boolean;

  from_currency?: CurrencyApiModel;
  to_currency?: CurrencyApiModel;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
