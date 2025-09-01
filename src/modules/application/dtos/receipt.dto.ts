import type { DocumentTypeDTO } from "./documenet-type.dto";
import type { ReceiptItemQueryDto } from "./receipt-item.dto";

export interface CreateReceiptDTO {
  purchase_order_id: string;
  documentType_id: string,
  remark: string,
  receipt_items: {
    purchase_order_item_id: string;
    payment_currency_id: string;
    payment_type?: string;
    remark: string;
  }[]

}

export interface UpdateReceiptDTO {
  receipt_item: {
    purchase_order_item_id: string;
    payment_currency_id: string;
    payment_type?: string;
    remark: string;
  }[]
}

export interface ReciptQueryDto {
  id: string;
  purchase_order_id: string;
  documentType_id: string;
  remark: string;
  document_type: DocumentTypeDTO | null;
  receipt_items: ReceiptItemQueryDto[] | []
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
