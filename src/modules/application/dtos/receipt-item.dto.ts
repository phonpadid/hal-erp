import type { CurrencyDTO } from "./currency.dto";
import type { IPurchaseOrderItem } from "./receipt.dto";

export interface ReceiptItemQueryDto {
  id: string;
  purchase_order_item_id: string;
  payment_currency_id: string;
  payment_type: string;
  quantity: number;
  price: number;
  total: number;
  exchange_rate: number;
  vat: number;
  payment_total: number;
  remark: string;
  currency: CurrencyDTO;


  payment_currency: CurrencyDTO | null;
  purchase_order_item: IPurchaseOrderItem;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
