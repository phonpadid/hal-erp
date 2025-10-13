import type { IDocument, IPurchaseRequestItem } from "../receipt.dto";

export interface IReportPurchaseRequestDto {
  id: number;
  document_id: number;
  pr_number: string;
  requested_date: string;
  expired_date: string;
  purposes: string;
  created_at: string;
  update_at: string;
  itemCount: number;
  total: number;
  step: boolean;
  document: IDocument;
  purchase_request_item: IPurchaseRequestItem[]
}

export interface IReportMoney {
  status: string;
  total: number;
}
export interface IReportReceiptMoney {
  status: string;
  total: number;
  currency_code: string;
  currency_name: string;
  payment_total: number;
  total_vat: number;
}
