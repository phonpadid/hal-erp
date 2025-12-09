// Proposal related types

export interface ProposalApprover {
  id: number;
  user?: {
    id: number;
    username: string;
    position?: {
      id: number;
      name: string;
    };
  };
  department?: {
    id: number;
    name: string;
  };
  approved_at?: string;
}

export interface ProposalApprovalStep {
  id: number;
  step_number: number;
  status_id: number; // 1: pending, 2: approved, 3: rejected
  document_status: {
    id: number;
    name: string;
  };
  requires_file_upload: boolean;
  is_otp: boolean;
  doc_approver?: ProposalApprover[];
  remark?: string;
}

export interface ProposalUserApproval {
  id: number;
  approval_step: ProposalApprovalStep[];
}

export interface ProposalDocument {
  id: number;
  company?: {
    id: number;
    name: string;
    address?: string;
  };
  department?: {
    id: number;
    name: string;
  };
  requester?: {
    id: number;
    username: string;
    position?: {
      id: number;
      name: string;
    };
  };
  position?: Array<{
    id: number;
    name: string;
  }>;
}

export interface ProposalDocumentType {
  id: number;
  name: string;
  code: string;
}

export interface ProposalItem {
  id: number;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  budget_code?: string;
  specification?: string;
}

export interface ProposalDocumentAttachment {
  id: number;
  file_name: string;
  file_name_url?: string;
  file_type: string;
  file_size: number;
}

export interface ProposalDocumentDetail {
  id: number;
  proposal_number: string;
  title: string;
  created_at: string;
  updated_at?: string;
  document?: ProposalDocument;
  user_approval?: ProposalUserApproval;
  proposal_type?: ProposalDocumentType;
  total_amount?: number;
  remark?: string;
  status?: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  delivery_point?: string;
  proposal_items?: ProposalItem[];
  document_attachment?: ProposalDocumentAttachment[];
  received_by?: number;
  receipt_date?: string;
}

export interface ProposalDocument {
  id: number;
  proposal_number?: string;
  title?: string;
  created_at?: string;
  document?: ProposalDocument;
  user_approval?: ProposalUserApproval;
  total_amount?: number;
  remark?: string;
  company?: {
    id: number;
    name: string;
    address?: string;
  };
  department?: {
    id: number;
    name: string;
  };
  requester?: {
    id: number;
    username: string;
    position?: {
      id: number;
      name: string;
    };
  };
}

// Approval request types
export interface ApproveProposalRequest {
  proposal_id: number;
  step_id: number;
  remark?: string;
  files?: Array<{ file_name: string }>;
  otp_code?: string;
}

export interface RejectProposalRequest {
  proposal_id: number;
  step_id: number;
  reason: string;
}

export interface ProposalApprovalResponse {
  success: boolean;
  message: string;
  data?: any;
}

// User roles for approval permissions
export enum ProposalUserRole {
  HAL_GROUP_ADMIN = 'HAL_GROUP_ADMIN',
  ACCOUNT_ADMIN = 'ACCOUNT_ADMIN',
  ACCOUNT_USER = 'ACCOUNT_USER',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  SUPERVISOR = 'SUPERVISOR',
  STAFF = 'STAFF'
}

// Proposal status types
export enum ProposalStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

// Approval step status
export enum ApprovalStepStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3
}