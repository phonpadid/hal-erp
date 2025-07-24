import { formatDate } from "@/modules/shared/formatdate";

export class VendorsBankAccountEntity {
  private id: string;
  private vendor_id: string;
  private currency_id: number | string;
  private bank_name: string;
  private account_name: string;
  private account_number: string;
  private is_selected: boolean;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;
  private vendor?: {
    id: number;
    name: string;
    contact_info: string;
    created_at: string;
    updated_at: string;
  };
  private currency?: {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
  } | null;

  constructor(
    id: string,
    vendor_id: string,
    currency_id: string | number,
    bank_name: string,
    account_name: string,
    account_number: string,
    is_selected: boolean,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null,
    vendor?: {
      id: number;
      name: string;
      contact_info: string;
      created_at: string;
      updated_at: string;
    },
    currency?: {
      id: number;
      code: string;
      name: string;
      created_at: string;
      updated_at: string;
    } | null
  ) {
    this.id = id;
    this.vendor_id = vendor_id;
    this.currency_id = currency_id;
    this.bank_name = bank_name;
    this.account_name = account_name;
    this.account_number = account_number;
    this.is_selected = is_selected;
    this.created_at = formatDate(created_at);
    this.updated_at = formatDate(updated_at);
    this.deleted_at = deleted_at !== null ? formatDate(deleted_at) : null;
    this.vendor = vendor;
    this.currency = currency;
  }
  public getVendor() {
    return this.vendor;
  }

  public getCurrency() {
    return this.currency;
  }

  public getId(): string {
    return this.id;
  }

  public getvendor_id(): string {
    return this.vendor_id;
  }

  public getBankName(): string {
    return this.bank_name;
  }

  public getAccountName(): string {
    return this.account_name;
  }

  public getAccountNumber(): string {
    return this.account_number;
  }

  public getIsSelected(): boolean {
    return this.is_selected;
  }

  public getcurrency_id(): string | number {
    return this.currency_id;
  }

  public getcreated_at(): string {
    return this.created_at;
  }

  public getupdated_at(): string {
    return this.updated_at;
  }

  public getdeleted_at(): string | null {
    return this.deleted_at;
  }

  public isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  public setVendor(vendor: {
    id: number;
    name: string;
    contact_info: string;
    created_at: string;
    updated_at: string;
  }): void {
    this.vendor = vendor;
  }

  public setCurrency(
    currency: {
      id: number;
      code: string;
      name: string;
      created_at: string;
      updated_at: string;
    } | null
  ): void {
    this.currency = currency;
  }

  public updatevendor_id(vendor_id: string): void {
    this.vendor_id = vendor_id;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updatecurrency_id(currency_id: string | number): void {
    this.currency_id = currency_id;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public delete(): void {
    this.deleted_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.updated_at = this.deleted_at;
  }

  public restore(): void {
    this.deleted_at = null;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public static create(
    id: string,
    vendor_id: string,
    currency_id: string | number,
    bank_name: string,
    account_name: string,
    account_number: string,
    is_selected: boolean = false,
    vendor?: {
      id: number;
      name: string;
      contact_info: string;
      created_at: string;
      updated_at: string;
    },
    currency?: {
      id: number;
      code: string;
      name: string;
      created_at: string;
      updated_at: string;
    } | null
  ): VendorsBankAccountEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new VendorsBankAccountEntity(
      id,
      vendor_id,
      currency_id,
      bank_name,
      account_name,
      account_number,
      is_selected,
      now,
      now,
      null,
      vendor,
      currency
    );
  }
}
