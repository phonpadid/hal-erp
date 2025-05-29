export interface VendorInterface {
  id: string;
  name: string;
  contact_info: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
export interface VendorCreateInteface {
  name: string;
  contact_info: string;
}
export interface VendorUpdateIntrface {
  name?: string;
  contact_info?: string;
}
