import type { VendorsBankAccountEntity } from "../vendor_bank_accounts/vendors-bank-accounts.entities";

export class VendorsEntity {
  private id: string;
  private name: string;
  private contact_info: string;
  private vendor_bank_account: VendorsBankAccountEntity[];
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    name: string,
    contact_info: string,
    vendor_bank_account: VendorsBankAccountEntity[],
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.contact_info = contact_info;
    this.vendor_bank_account = vendor_bank_account;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  public getId(): string {
    return this.id;
  }

  public getVendorBankAccount(): VendorsBankAccountEntity[] {
    return this.vendor_bank_account;
  }

  public getname(): string {
    return this.name;
  }

  public getcontact_info(): string {
    return this.contact_info;
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

  public updatename(name: string): void {
    this.name = name;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }
  public updateVendorBankAccount(bankAccounts: VendorsBankAccountEntity[]): void {
    this.vendor_bank_account = bankAccounts;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updatecontact_info(contact_info: string): void {
    this.contact_info = contact_info;
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
    name: string,
    contact_info: string,
    vendor_bank_account: VendorsBankAccountEntity[] = []
  ): VendorsEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new VendorsEntity(id, name, contact_info, vendor_bank_account, now, now, null);
  }
}
