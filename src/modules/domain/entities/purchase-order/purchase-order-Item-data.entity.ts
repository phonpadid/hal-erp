/* eslint-disable @typescript-eslint/no-explicit-any */

export class PurchaseOrderItemDataEntity {
  private readonly id: number;
  private readonly purchase_order_id: number;
  private readonly purchase_request_item_id: number;
  private readonly budget_item_id: number;
  private readonly remark: string;
  private readonly quantity: number;
  private readonly price: number;
  private readonly total: number;
  private readonly vat_total: number;
  private readonly total_with_vat: number;
  private readonly is_vat: boolean;
  private readonly created_at: string;
  private readonly updated_at: string;
  private readonly budget_item: any;
  private readonly selected_vendor: SelectedVendorEntity[];

  constructor(data: any) {
    this.id = data.id;
    this.purchase_order_id = data.purchase_order_id;
    this.purchase_request_item_id = data.purchase_request_item_id;
    this.budget_item_id = data.budget_item_id || 0;
    this.remark = data.remark || '';
    this.quantity = data.quantity || 0;
    this.price = data.price || 0;
    this.total = data.total || 0;
    this.vat_total = data.vat_total || 0;
    this.total_with_vat = data.total_with_vat || 0;
    this.is_vat = data.is_vat || false;
    this.created_at = data.created_at || '';
    this.updated_at = data.updated_at || '';
    this.budget_item = data.budget_item;

    // แปลง selected_vendor เป็น array ของ SelectedVendorEntity
    this.selected_vendor = Array.isArray(data.selected_vendor)
      ? data.selected_vendor.map((vendor: any) => new SelectedVendorEntity(vendor))
      : [];
  }

  // Getters
  public getId(): number {
    return this.id;
  }

  public getPurchaseOrderId(): number {
    return this.purchase_order_id;
  }

  public getPurchaseRequestItemId(): number {
    return this.purchase_request_item_id;
  }

  public getBudgetItemId(): number {
    return this.budget_item_id;
  }

  public getRemark(): string {
    return this.remark;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getPrice(): number {
    return this.price;
  }

  public getTotal(): number {
    return this.total;
  }

  public getVatTotal(): number {
    return this.vat_total;
  }

  public getTotalWithVat(): number {
    return this.total_with_vat;
  }

  public getIsVat(): boolean {
    return this.is_vat;
  }

  public getCreatedAt(): string {
    return this.created_at;
  }

  public getUpdatedAt(): string {
    return this.updated_at;
  }

  public getBudgetItem(): any {
    return this.budget_item;
  }

  public getSelectedVendors(): SelectedVendorEntity[] {
    return this.selected_vendor;
  }

  public getSelectedVendor(): SelectedVendorEntity | null {
    if (this.selected_vendor && this.selected_vendor.length > 0) {
      // หาผู้ขายที่ถูกเลือก (selected = true)
      const selectedVendor = this.selected_vendor.find(vendor => vendor.getSelected());
      return selectedVendor || this.selected_vendor[0];
    }
    return null;
  }

  // Helper methods
  public getQuotationImageUrl(): string | null {
    const vendor = this.getSelectedVendor();
    return vendor ? vendor.getFilenameUrl() : null;
  }

  public getVendorName(): string {
    const vendor = this.getSelectedVendor();
    return vendor && vendor.getVendor() ? vendor.getVendor().name : 'N/A';
  }

  public getVendorContactInfo(): string {
    const vendor = this.getSelectedVendor();
    return vendor && vendor.getVendor() ? vendor.getVendor().contact_info : 'N/A';
  }

  public getBankAccount(): any {
    const vendor = this.getSelectedVendor();
    return vendor ? vendor.getVendorBankAccount() : null;
  }

  public getAccountName(): string {
    const bankAccount = this.getBankAccount();
    return bankAccount ? bankAccount.account_name : 'N/A';
  }

  public getAccountNumber(): string {
    const bankAccount = this.getBankAccount();
    return bankAccount ? bankAccount.account_number : 'N/A';
  }

  public getBank(): any {
    const bankAccount = this.getBankAccount();
    return bankAccount ? bankAccount.bank : null;
  }

  public getBankName(): string {
    const bank = this.getBank();
    return bank ? bank.name : 'N/A';
  }

  public getBankShortName(): string {
    const bank = this.getBank();
    return bank ? bank.short_name : 'N/A';
  }

  public getBankLogo(): string | null {
    const bank = this.getBank();
    return bank ? bank.logoUrl : null;
  }

  public getCurrency(): any {
    const bankAccount = this.getBankAccount();
    return bankAccount ? bankAccount.currency : null;
  }

  public getCurrencyCode(): string {
    const currency = this.getCurrency();
    return currency ? currency.code : 'LAK';
  }

  public getCurrencyName(): string {
    const currency = this.getCurrency();
    return currency ? currency.name : 'Lao Kip';
  }
}

class SelectedVendorEntity {
  private readonly id: number;
  private readonly purchase_order_item_id: number;
  private readonly vendor_id: number;
  private readonly vendor_bank_account_id: number;
  private readonly filename: string;
  private readonly filename_url: string;
  private readonly reason: string;
  private readonly selected: boolean;
  private readonly created_at: string;
  private readonly updated_at: string;
  private readonly vendor: any;
  private readonly vendor_bank_account: any;

  constructor(data: any) {
    this.id = data.id;
    this.purchase_order_item_id = data.purchase_order_item_id;
    this.vendor_id = data.vendor_id;
    this.vendor_bank_account_id = data.vendor_bank_account_id;
    this.filename = data.filename || '';
    this.filename_url = data.filename_url || '';
    this.reason = data.reason || '';
    this.selected = data.selected || false;
    this.created_at = data.created_at || '';
    this.updated_at = data.updated_at || '';
    this.vendor = data.vendor || null;
    this.vendor_bank_account = data.vendor_bank_account || null;
  }

  public getId(): number {
    return this.id;
  }

  public getPurchaseOrderItemId(): number {
    return this.purchase_order_item_id;
  }

  public getVendorId(): number {
    return this.vendor_id;
  }

  public getVendorBankAccountId(): number {
    return this.vendor_bank_account_id;
  }

  public getFilename(): string {
    return this.filename;
  }

  public getFilenameUrl(): string {
    return this.filename_url;
  }

  public getReason(): string {
    return this.reason;
  }

  public getSelected(): boolean {
    return this.selected;
  }

  public getCreatedAt(): string {
    return this.created_at;
  }

  public getUpdatedAt(): string {
    return this.updated_at;
  }

  public getVendor(): any {
    return this.vendor;
  }

  public getVendorBankAccount(): any {
    return this.vendor_bank_account;
  }
}
