import type { CurrencyDTO } from "./currency.dto";

export interface CreateExchangeRateDTO {
  from_currency_id: number;
  to_currency_id: number;
  rate: number;
  is_active?: boolean;
}

export interface UpdateExchangeRateDTO {
  id: string;
  from_currency_id: number;
  to_currency_id: number;
  rate: number;
  is_active: string;
}

export interface ExchangeRateDTO {
  id: string;
  from_currency_id: number;
  to_currency_id: number;
  rate: number;
  is_active?: boolean;

  from_currency: CurrencyDTO;
  to_currency: CurrencyDTO;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
