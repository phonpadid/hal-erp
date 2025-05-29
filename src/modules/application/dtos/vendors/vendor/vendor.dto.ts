export interface VendorDto {
  id: string;
  name: string;
  contact_info: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateVendorDto {
  name: string;
  contact_info: string;
}
export interface UpdateVendorDto {
  name?: string;
  contact_info?: string;
}
