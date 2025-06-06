export class BudGetItemDetailsEntity {
  private id: string;
  private budget_item_id: string;
  private name: string;
  private province_id?: string;
  private description?: string;
  private allocated_amount?: string;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    budget_item_id: string,
    name: string,
    province_id: string | undefined,
    description: string | undefined,
    allocated_amount: string | undefined,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null
  ) {
    this.id = id;
    this.budget_item_id = budget_item_id;
    this.name = name;
    this.province_id = province_id;
    this.description = description;
    this.allocated_amount = allocated_amount;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getBudgetItemId(): string {
    return this.budget_item_id;
  }

  public getProvince(): string | undefined {
    return this.province_id;
  }
  public getAllocatedAmount(): string | undefined {
    return this.allocated_amount;
  }
  public getDescription(): string | undefined {
    return this.description;
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

  public updateBudgetItem(budget_item_id: string): void {
    this.budget_item_id = budget_item_id;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateProvinces(provinces: string): void {
    this.province_id = provinces;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateAllocateAmount(allocated_amount: string | undefined): void {
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
    budget_item_id: string,
    province_id: string,
    allocated_amount: string | undefined,
    description: string
  ): BudGetItemDetailsEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new BudGetItemDetailsEntity(
      id,
      name,
      budget_item_id,
      province_id,
      description,
      allocated_amount,
      now,
      now,
      null
    );
  }
}
