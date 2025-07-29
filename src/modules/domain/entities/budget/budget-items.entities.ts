import type { BudgetAccountInterface } from "@/modules/interfaces/budget/budget-account.interface";
import { formatDate } from "@/modules/shared/formatdate";
import { formatPrice } from "@/modules/shared/utils/format-price";

export class BudGetItemEntity {
  private id: string;
  private budget_account_id: string;
  private budget_account: BudgetAccountInterface | undefined;
  private name: string;
  private allocated_amount: string | number;
  private format_allocated_amount: string | number;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    budget_account_id: string,
    name: string,
    allocated_amount: string | number,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null,
    budget_account?: BudgetAccountInterface
  ) {
    this.id = id;
    this.budget_account_id = budget_account_id;
    this.name = name;
    this.budget_account = budget_account;
    this.allocated_amount = allocated_amount;
    this.format_allocated_amount = formatPrice(Number(allocated_amount));
    this.created_at = formatDate(created_at);
    this.updated_at = formatDate(updated_at);
    this.deleted_at = deleted_at ? formatDate(deleted_at) : null;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getBudgetAccountsId(): string {
    return this.budget_account_id;
  }

  public getAllocatedAmount(): number | string | undefined {
    return this.allocated_amount;
  }

  public getFormattedAllocatedAmount(): string | number | undefined {
    return this.format_allocated_amount;
  }

  public getBudgetAccount(): BudgetAccountInterface | undefined {
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
    allocated_amount: number
  ): BudGetItemEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new BudGetItemEntity(id, name, budget_account_id, allocated_amount, now, now, null);
  }
}
