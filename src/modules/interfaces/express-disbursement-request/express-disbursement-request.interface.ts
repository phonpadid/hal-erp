/* eslint-disable @typescript-eslint/no-explicit-any */

// Shared nested API models (mirrors purchase-request.interface.ts shapes so the
// express approval detail can render the same header/step structures).
export interface DocumentType {
  id: number;
  name: string;
  code?: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}

export interface UserSignature {
  id?: number;
  signature_url?: string | null;
}

export interface Requester {
  id: number;
  username?: string;
  user_signature?: UserSignature | null;
}

export interface Company {
  id: number;
  name: string;
}

/**
 * A single approval step as returned on an express document's user_approval.
 * NOTE the two NEW capability flags — requires_budget_selection and
 * requires_account_code — alongside the pre-existing is_otp / requires_file_upload.
 * The step-aware approval detail decides which widget to show purely from these.
 */
export interface ExpressApprovalStep {
  id: number;
  user_approval_id: number;
  step_number: number;
  approver_id: number;
  status_id: number; // 1 = pending, 2 = approved, 3 = rejected
  remark: string;
  is_otp: boolean;
  requires_file_upload: boolean;
  requires_budget_selection: boolean;
  requires_account_code: boolean;
  approved_at?: string | null;
  created_at?: string;
  approver?: any;
  position?: any;
  doc_approver?: Array<{
    user: { username: string };
    department?: { name: string };
  }>;
}

export interface ExpressUserApproval {
  id: number;
  document_id: number;
  status_id: number;
  document_status?: { id: number; name: string } | null;
  approval_step: ExpressApprovalStep[];
}

export type UserApproval = ExpressUserApproval;

// Client-only param shape used when building an entity from the create form.
export interface ExpressDisbursementRequestItemParams {
  title: string;
  fileName: string | null;
  fileNameUrl?: string | null;
  quantity: number;
  unitId: number | string;
  price: number;
  remark?: string;
}

// snake_case API field shapes.
export interface ExpressDisbursementRequestItemModel {
  id?: number | string;
  title: string;
  file_name?: string | null;
  file_name_url?: string | null;
  quantity: number;
  unit_id: number | string;
  price: number;
  total_price: number;
  remark?: string;
  budget_item_id?: number | null;
}

export interface ExpressDisbursementRequestCreate {
  purpose: string;
  total: number;
  express_disbursement_request_items: ExpressDisbursementRequestItemModel[];
}

export interface ExpressDisbursementRequestUpdate {
  purpose?: string;
  total?: number;
  express_disbursement_request_items?: ExpressDisbursementRequestItemModel[];
}

export interface ExpressDisbursementRequestModel {
  id: number | string;
  edr_number?: string | null;
  purpose: string;
  total: number;
  status?: string;
  document_type?: DocumentType | null;
  department?: Department | null;
  requester?: Requester | null;
  position?: Position | null;
  company?: Company | null;
  user_approval?: ExpressUserApproval | null;
  express_disbursement_request_items?: ExpressDisbursementRequestItemModel[];
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}
