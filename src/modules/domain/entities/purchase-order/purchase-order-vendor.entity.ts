export class PurchaseOrderVendorEntity {
  // ทำให้เป็น private เพื่อบังคับให้สร้างผ่าน 'create' เท่านั้น
  private constructor(
    public readonly vendorId: number,
    public readonly vendorBankAccountId: number | null,
    public readonly filename: string | null,
    public readonly reason: string | null
  ) {}

  /**
   * Factory method สำหรับสร้าง Vendor Entity
   * @returns {PurchaseOrderVendorEntity}
   */
  public static create(
    vendorId: number,
    vendorBankAccountId: number | null,
    filename: string | null,
    reason: string | null
  ): PurchaseOrderVendorEntity {
    if (vendorId <= 0) {
      throw new Error("Vendor ID is invalid.");
    }
    return new PurchaseOrderVendorEntity(vendorId, vendorBankAccountId, filename, reason);
  }
}
