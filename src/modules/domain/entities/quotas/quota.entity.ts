// Generate a simple UUID-like ID for browser compatibility
const generateId = () => {
  return 'quota_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
};

export class QuotaEntity {
  private readonly id: string;
  private readonly vendor_product_id: number;
  private readonly company_id?: number;
  private readonly vendor_id?: number;
  private readonly product_id?: number;
  private readonly qty: number;
  private readonly year: string;
  private readonly created_at: Date;
  private readonly updated_at: Date;
  private readonly deleted_at: Date | null;

  constructor(props: {
    id: string;
    vendor_product_id: number;
    company_id?: number;
    vendor_id?: number;
    product_id?: number;
    qty: number;
    year: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }) {
    this.id = props.id;
    this.vendor_product_id = props.vendor_product_id;
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
    vendor_product_id: number;
    company_id?: number;
    vendor_id?: number;
    product_id?: number;
    qty: number;
    year: string;
  }): QuotaEntity {
    const now = new Date();
    return new QuotaEntity({
      id: generateId(),
      vendor_product_id: props.vendor_product_id,
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
    vendor_product_id: number;
    company_id?: number;
    vendor_id?: number;
    product_id?: number;
    qty: number;
    year: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }): QuotaEntity {
    return new QuotaEntity(props);
  }

  // Static method to create from API response
  public static fromApiResponse(apiData: any): QuotaEntity {
   

    if (!apiData) {
      throw new Error("API data is undefined");
    }

    if (!apiData.id) {
      throw new Error("API data missing required field: id");
    }

    

    // Helper function to safely parse dates
    const safeParseDate = (dateValue: any): Date => {
      if (!dateValue) return new Date();

      try {
        const date = new Date(dateValue);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          
          return new Date();
        }
        return date;
      } catch (error) {
        console.warn("Error parsing date:", dateValue, error, "using current date instead");
        return new Date();
      }
    };

    // Helper function to safely parse nullable dates
    const safeParseNullableDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;

      try {
        const date = new Date(dateValue);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return null;
        }
        return date;
      } catch (error) {
        console.warn("Error parsing nullable date:", dateValue, error, "using null instead");
        return null;
      }
    };

    return new QuotaEntity({
      id: apiData.id.toString(),
      vendor_product_id: apiData.vendor_product_id,
      company_id: apiData.company_id,
      vendor_id: apiData.vendor_id,
      product_id: apiData.product_id,
      qty: apiData.qty,
      year: apiData.year,
      created_at: safeParseDate(apiData.created_at),
      updated_at: safeParseDate(apiData.updated_at),
      deleted_at: safeParseNullableDate(apiData.deleted_at),
    });
  }

  public update(props: {
    vendor_product_id?: number;
    company_id?: number;
    vendor_id?: number;
    product_id?: number;
    qty?: number;
    year?: string;
  }): QuotaEntity {
    return new QuotaEntity({
      id: this.id,
      vendor_product_id: props.vendor_product_id ?? this.vendor_product_id,
      company_id: props.company_id ?? this.company_id,
      vendor_id: props.vendor_id ?? this.vendor_id,
      product_id: props.product_id ?? this.product_id,
      qty: props.qty ?? this.qty,
      year: props.year ?? this.year,
      created_at: this.created_at,
      updated_at: new Date(),
      deleted_at: this.deleted_at,
    });
  }

  public softDelete(): QuotaEntity {
    return new QuotaEntity({
      id: this.id,
      vendor_product_id: this.vendor_product_id,
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

  public getVendorProductId(): number {
    return this.vendor_product_id;
  }

  public getCompanyId(): number | undefined {
    return this.company_id;
  }

  public getVendorId(): number | undefined {
    return this.vendor_id;
  }

  public getProductId(): number | undefined {
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

    if (this.company_id && this.company_id <= 0) {
      errors.push("Invalid company ID");
    }

    if (this.vendor_id && this.vendor_id <= 0) {
      errors.push("Invalid vendor ID");
    }

    if (this.product_id && this.product_id <= 0) {
      errors.push("Invalid product ID");
    }

    return errors;
  }
}