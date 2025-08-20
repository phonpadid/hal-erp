interface VendorCreateProps {
  vendorId: number;
  vendorBankAccountId: number | null;
  filename: string | null;
  reason: string | null;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
}

export class PurchaseOrderVendorEntity {
  private readonly createdBy: string;
  private readonly createdAt: string;
  private readonly updatedBy: string;
  private readonly updatedAt: string;

  private constructor(
    private readonly vendorId: number,
    private readonly vendorBankAccountId: number | null,
    private readonly filename: string | null,
    private readonly reason: string | null,
    createdBy: string,
    createdAt: string,
    updatedBy?: string,
    updatedAt?: string
  ) {
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedBy = updatedBy || createdBy;
    this.updatedAt = updatedAt || createdAt;
  }

  public static create(props: VendorCreateProps): PurchaseOrderVendorEntity {
    if (props.vendorId <= 0) {
      throw new Error("Vendor ID is invalid.");
    }

    return new PurchaseOrderVendorEntity(
      props.vendorId,
      props.vendorBankAccountId,
      props.filename,
      props.reason,
      props.created_by,
      props.created_at,
      props.updated_by,
      props.updated_at
    );
  }

  // Getters
  public getVendorId(): number {
    return this.vendorId;
  }

  public getVendorBankAccountId(): number | null {
    return this.vendorBankAccountId;
  }

  public getFilename(): string | null {
    return this.filename;
  }

  public getReason(): string | null {
    return this.reason;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }
}
