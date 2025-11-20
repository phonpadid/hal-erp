// Generate a simple UUID-like ID for browser compatibility
const generateId = () => {
  return 'vendor_product_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
};

export class VendorProductEntity {
  private readonly id: string;
  private readonly vendor_id: number;
  private readonly product_id: number;
  private readonly product_name?: string;
  private readonly vendor_name?: string;
  private readonly created_at: Date;
  private readonly updated_at: Date;
  private readonly deleted_at: Date | null;

  constructor(props: {
    id: string;
    vendor_id: number;
    product_id: number;
    product_name?: string;
    vendor_name?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }) {
    this.id = props.id;
    this.vendor_id = props.vendor_id;
    this.product_id = props.product_id;
    this.product_name = props.product_name;
    this.vendor_name = props.vendor_name;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
  }

  public static create(props: {
    vendor_id: number;
    product_id: number;
    product_name?: string;
    vendor_name?: string;
  }): VendorProductEntity {
    const now = new Date();
    return new VendorProductEntity({
      id: generateId(),
      vendor_id: props.vendor_id,
      product_id: props.product_id,
      product_name: props.product_name,
      vendor_name: props.vendor_name,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
  }

  public static restore(props: {
    id: string;
    vendor_id: number;
    product_id: number;
    product_name?: string;
    vendor_name?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }): VendorProductEntity {
    return new VendorProductEntity(props);
  }

  // Static method to create from API response
  public static fromApiResponse(apiData: any): VendorProductEntity {
    // Handle both old and new API response formats
    const vendorName = apiData.vendor?.name || apiData.vendor_name;
    const productName = apiData.product?.name || apiData.product_name;

    return new VendorProductEntity({
      id: apiData.id.toString(),
      vendor_id: Number(apiData.vendor_id),
      product_id: apiData.product_id,
      product_name: productName,
      vendor_name: vendorName,
      created_at: apiData.created_at ? new Date(apiData.created_at) : new Date(),
      updated_at: apiData.updated_at ? new Date(apiData.updated_at) : new Date(),
      deleted_at: apiData.deleted_at ? new Date(apiData.deleted_at) : null,
    });
  }

  public update(props: {
    vendor_id?: number;
    product_id?: number;
    product_name?: string;
    vendor_name?: string;
  }): VendorProductEntity {
    return new VendorProductEntity({
      id: this.id,
      vendor_id: props.vendor_id ?? this.vendor_id,
      product_id: props.product_id ?? this.product_id,
      product_name: props.product_name ?? this.product_name,
      vendor_name: props.vendor_name ?? this.vendor_name,
      created_at: this.created_at,
      updated_at: new Date(),
      deleted_at: this.deleted_at,
    });
  }

  public softDelete(): VendorProductEntity {
    return new VendorProductEntity({
      id: this.id,
      vendor_id: this.vendor_id,
      product_id: this.product_id,
      product_name: this.product_name,
      vendor_name: this.vendor_name,
      created_at: this.created_at,
      updated_at: new Date(),
      deleted_at: new Date(),
    });
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getVendorId(): number {
    return this.vendor_id;
  }

  public getProductId(): number {
    return this.product_id;
  }

  public getProductName(): string | undefined {
    return this.product_name;
  }

  public getVendorName(): string | undefined {
    return this.vendor_name;
  }

  public getCreatedAt(): Date {
    return this.created_at;
  }

  public getUpdatedAt(): Date {
    return this.updated_at;
  }

  public getDeletedAt(): Date | null {
    return this.deleted_at;
  }

  public isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  // Validation methods
  public validate(): string[] {
    const errors: string[] = [];

    if (this.vendor_id <= 0) {
      errors.push("Invalid vendor ID");
    }

    if (this.product_id <= 0) {
      errors.push("Invalid product ID");
    }

    return errors;
  }

  // Display name for dropdown
  public getDisplayName(): string {
    return this.product_name || `Product ${this.product_id}`;
  }

  // Display name with vendor
  public getDisplayNameWithVendor(): string {
    const productName = this.product_name || `Product ${this.product_id}`;
    const vendorName = this.vendor_name ? ` (${this.vendor_name})` : "";
    return `${productName}${vendorName}`;
  }
}