export interface DocumentTypeDTO {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateDocumentTypeDTO {
  name: string;
  code: string;
}
export interface UpdateDocumentTypeDTO {
  id: string;
  name?: string;
  code?: string;
}
