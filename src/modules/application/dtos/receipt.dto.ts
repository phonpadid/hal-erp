import type { DepartmentDTO } from "./departments/department.dto";
import type { DocumentTypeDTO } from "./documenet-type.dto";
import type { ReceiptItemQueryDto } from "./receipt-item.dto";
import type { UserApprovalDTO } from "./user-approvals/user-approval.dto";
import type { UserDTO } from "./user.dto";
import type { UnitDTO } from "./unit.dto";
import type { VendorDto } from "./vendors/vendor/vendor.dto";
import type { VendorBankAccountDto } from "./vendors/vendor_bank_accounts/vendor-bank-accounts";

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
  purchase_request_id?: string;

  po_number?: string;
  pr_number?: string;
  po_doc_type?: string;
  pr_doc_type?: string;

  document_id: string;
  receipt_number: string;
  receipt_date: string;
  received_by: number;
  step: boolean;
  account_code?: string;
  currency_totals: ICurrencyTotal[];
  document: IDocument;
  user_approval: UserApprovalDTO;


  remark: string;
  document_type: DocumentTypeDTO | null;
  receipt_item: ReceiptItemQueryDto[] | [],
  sub_total?: number;
  vat?: number;
  total?: number;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
  document_attachment?: {
    id: number;
    file_name_url?: string;
  }[]
}



export interface ICurrencyTotal {
  id: number,
  code: string,
  name: string,
  amount: number
}

export interface IDocument {
  id: number;
  title: string;
  description: string;
  total_amount: number;
  department_id: number;
  requester_id: number;
  document_type_id: number;
  department: DepartmentDTO;
  document_type: DocumentTypeDTO;
  requester: UserDTO;
  position: { id: number; name: string }[],
}


export interface IApprovalReceiptDto {
  type: string;
  statusId: number;
  remark?: string;
  is_otp?: boolean;
  approval_id?: number;
  account_code?: string;
  otp?: string;
  files?: {
    file_name: string
  }[]
}

export interface IPurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  purchase_request_item_id: number;
  budget_item_id: number;
  remark: string;
  quantity: number;
  price: number;
  total: number;
  vat_total: number;
  total_with_vat: number;
  purchase_request_item: IPurchaseRequestItem;
  selected_vendor: ISelectVendor[];
  budget_item: { id: number; name: string; budget_account: { id: number; code: string; name: string }}
}

export interface IPurchaseRequestItem {
  id: number;
  purchase_request_id: number;
  title: string;
  file_name_url: string;
  quantity: number;
  price: number;
  total_price: number;
  remark: string;
  unit: UnitDTO
  created_at?: string;
}

export interface ISelectVendor {
  id: number;
  purchase_order_item_id: number;
  vendor_id: number;
  filename_url: string;
  reason: string;
  vendor: VendorDto;
  vendor_bank_account: VendorBankAccountDto


  price: number;
  total_price: number;
  remark: string;
  unit: UnitDTO
}
export interface IReportReceiptCount {
  amount: number;
}
