import type { Purchase_order_itemsInterface } from "@/modules/interfaces/approval-step.interface";
import type { CurrencyDTO } from "./currency.dto";

export interface ReceiptItemQueryDto {
  id: string;
  purchase_order_item_id: string;
  payment_currency_id: string;
  payment_type: string;
  remark: string;
  purchase_order_item: Purchase_order_itemsInterface | null;
  payment_currency: CurrencyDTO | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
