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
  remark?: string;
}
export interface Department {
  id: number;
  name: string;
}

export interface Requester {
  id: number;
  username: string;
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
