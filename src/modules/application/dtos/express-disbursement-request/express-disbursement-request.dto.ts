// DTOs for Express Disbursement Request. API fields are snake_case; client-only
// fields are camelCase. Budget selection / slip / account_code are NOT part of
// the create/update payload — they are captured later via /approve-step.

export interface CreateExpressDisbursementRequestItemDTO {
  title: string;
  file_name?: string | null;
  file_name_url?: string | null;
  quantity: number;
  unit_id: number | string;
  price: number;
  total_price: number;
  remark?: string;
}

export interface CreateExpressDisbursementRequestDTO {
  purpose: string;
  total: number;
  express_disbursement_request_items: CreateExpressDisbursementRequestItemDTO[];
}

export interface UpdateExpressDisbursementRequestDTO {
  purpose?: string;
  total?: number;
  express_disbursement_request_items?: CreateExpressDisbursementRequestItemDTO[];
}

export interface ExpressDisbursementRequestItemDTO {
  id: string;
  title: string;
  file_name: string | null;
  file_name_url: string | null;
  quantity: number;
  unit_id: string;
  price: number;
  total_price: number;
  remark: string;
  budget_item_id: number | null;
}

export interface ExpressDisbursementRequestDTO {
  id: string;
  edr_number: string | null;
  purpose: string;
  total: number;
  status: string;
  createdAt: string | null;
  deletedAt: string | null;
}
