import { formatDate } from "@/modules/shared/formatdate";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { BudGetAccountsEntity } from "./budget-accounts.entities";

export class BudGetItemEntity {
  private id: string;
  private budget_account_id: string;
  private budget_account: BudGetAccountsEntity | undefined;
  private name?: string;
  private allocated_amount: number;
  private use_amount: number | null;
  private balance_amount: number | null;
  private description: string | null;
  private format_allocated_amount: string;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    budget_account_id: string,
    name: string,
    allocated_amount: number,
    use_amount: number | null,
    balance_amount: number | null,
    description: string | null,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null,
    budget_account?: BudGetAccountsEntity
  ) {
    this.id = id;
    this.budget_account_id = budget_account_id;
    this.name = name;
    this.budget_account = budget_account;
    this.description = description;
    this.allocated_amount = allocated_amount;
    this.use_amount = use_amount;
    this.balance_amount = balance_amount;
    this.format_allocated_amount = formatPrice(Number(allocated_amount));
    this.created_at = formatDate(created_at);
    this.updated_at = formatDate(updated_at);
    this.deleted_at = deleted_at ? formatDate(deleted_at) : null;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name || "";
  }

  public getBudgetAccountsId(): string {
    return this.budget_account_id;
  }

  public getAllocatedAmount(): number {
    return this.allocated_amount;
  }

  public getUseAmount(): number | null {
    return this.use_amount;
  }

  public getBalance(): number | null {
    return this.balance_amount;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getFormattedAllocatedAmount(): string {
    return this.format_allocated_amount;
  }

  public getBudgetAccount(): BudGetAccountsEntity | undefined {
    return this.budget_account;
  }

  public getCreatedAt(): string {
    return this.created_at;
  }

  public getUpdatedAt(): string {
    return this.updated_at;
  }

  public getDeletedAt(): string | null {
    return this.deleted_at;
  }

  public isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  public updateName(name: string): void {
    this.name = name;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateBudgetAccounts(budget_account_id: string): void {
    this.budget_account_id = budget_account_id;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateAllocateAmount(allocated_amount: number): void {
    this.allocated_amount = allocated_amount;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public delete(): void {
    this.deleted_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.updated_at = this.deleted_at;
  }

  public static create(
    id: string,
    name: string,
    budget_account_id: string,
    allocated_amount: number,
    description: string
  ): BudGetItemEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new BudGetItemEntity(
      id,
      budget_account_id,
      name,
      allocated_amount,
      null,
      null,
      description,
      now,
      now,
      null
    );
  }
}
