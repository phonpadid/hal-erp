
export interface IDocumentTypeId {
  document_type_id?: string;
}
export interface PurchaseRequestItemParams {
  title: string;
  fileName: string;
  fileNameUrl?: string | null;
  quantity: number;
  unitId: number;
  price: number;
  total: number;
  remark?: string;
  quotaId?: number;
}
export interface Department {
  id: number;
  name: string;
}

export interface Requester {
  id: number;
  username: string;
  created_at?: string;
  user_signature: UserSignature | null;
}

export interface Position {
  id: number;
  name: string;
}
export interface DocumentType {
  id: string;
  code: string;
  name: string;
}
export interface StatusSummary {
  status: string;
  amount: number;
}

export interface DocumentStatus {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: number;
  user_approval_id: number;
  step_number: number;
  approver_id: number;
  approved_at?: string | null;
  doc_approver?: Array<{
        user: {
          id: string;
          username: string;
        };
        department?: Department;
      }>;
  status_id: number;
  remark: string;
  is_otp: boolean;
  requires_file_upload: boolean;
  created_at: string;
  updated_at: string;
  document_status: DocumentStatus;
  approver: Requester | null;
  position?: Position | null;
  // doc_approver?: {
  //   user? : UserDTO
  //   department?: Department | null;
  // }[]
}

export interface UserApproval {
  id: number;
  document_id: number;
  status_id: number;
  created_at: string;
  updated_at: string;
  document_status: DocumentStatus;
  approval_step: ApprovalStep[];
}

export interface UserSignature {
  id: number;
  user_id: number;
  file_name: string;
  file_name_url: string;
  signature_url: string;
  created_at: string;
  updated_at: string;

}

export interface Company {
  id: number;
  name: string;
  logo: string;
  logo_url: string;
  tel: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}
