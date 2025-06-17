export interface PurchaseRequestInterface {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price?: number; // Optional field, can be undefined
  note?: string;
}
