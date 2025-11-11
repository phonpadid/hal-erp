// Generate a simple UUID-like ID for browser compatibility
const generateId = () => {
  return 'quota_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
};

export class QuotaEntity {
  private readonly id: string;
  private readonly company_id: number;
  private readonly vendor_id: number;
  private readonly product_id: number;
  private readonly qty: number;
  private readonly year: string;
  private readonly created_at: Date;
  private readonly updated_at: Date;
  private readonly deleted_at: Date | null;

  constructor(props: {
    id: string;
    company_id: number;
    vendor_id: number;
    product_id: number;
    qty: number;
    year: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }) {
    this.id = props.id;
    this.company_id = props.company_id;
    this.vendor_id = props.vendor_id;
    this.product_id = props.product_id;
    this.qty = props.qty;
    this.year = props.year;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
  }

  public static create(props: {
    company_id: number;
    vendor_id: number;
    product_id: number;
    qty: number;
    year: string;
  }): QuotaEntity {
    const now = new Date();
    return new QuotaEntity({
      id: generateId(),
      company_id: props.company_id,
      vendor_id: props.vendor_id,
      product_id: props.product_id,
      qty: props.qty,
      year: props.year,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
  }

  public static restore(props: {
    id: string;
    company_id: number;
    vendor_id: number;
    product_id: number;
    qty: number;
    year: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }): QuotaEntity {
    return new QuotaEntity(props);
  }

  public update(props: {
    company_id: number;
    vendor_id: number;
    product_id: number;
    qty: number;
    year: string;
  }): QuotaEntity {
    return new QuotaEntity({
      id: this.id,
      company_id: props.company_id,
      vendor_id: props.vendor_id,
      product_id: props.product_id,
      qty: props.qty,
      year: props.year,
      created_at: this.created_at,
      updated_at: new Date(),
      deleted_at: this.deleted_at,
    });
  }

  public softDelete(): QuotaEntity {
    return new QuotaEntity({
      id: this.id,
      company_id: this.company_id,
      vendor_id: this.vendor_id,
      product_id: this.product_id,
      qty: this.qty,
      year: this.year,
      created_at: this.created_at,
      updated_at: new Date(),
      deleted_at: new Date(),
    });
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getCompanyId(): number {
    return this.company_id;
  }

  public getVendorId(): number {
    return this.vendor_id;
  }

  public getProductId(): number {
    return this.product_id;
  }

  public getQty(): number {
    return this.qty;
  }

  public getYear(): string {
    return this.year;
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
  public isValidYear(): boolean {
    const yearNum = parseInt(this.year);
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= 2100;
  }

  public isValidQty(): boolean {
    return this.qty > 0;
  }

  public validate(): string[] {
    const errors: string[] = [];

    if (!this.isValidYear()) {
      errors.push("Invalid year format");
    }

    if (!this.isValidQty()) {
      errors.push("Quantity must be greater than 0");
    }

    if (this.company_id <= 0) {
      errors.push("Invalid company ID");
    }

    if (this.vendor_id <= 0) {
      errors.push("Invalid vendor ID");
    }

    if (this.product_id <= 0) {
      errors.push("Invalid product ID");
    }

    return errors;
  }
}