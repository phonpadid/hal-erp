// budget-item-details.entities.ts
export class BudGetItemDetailsEntity {
  private id: string;
  private name: string;
  private budget_item_id: string;
  private description: string;
  private province_id: string;
  private province: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  } | null;
  private allocated_amount: string;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    name: string,
    budget_item_id: string,
    description: string,
    province_id: string,
    province: {
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
    } | null,
    allocated_amount: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.budget_item_id = budget_item_id;
    this.description = description;
    this.province_id = province_id;
    this.province = province;
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

  public getProvinceId(): string {
    return this.province_id;
  }

  public getProvince(): {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  } | null {
    return this.province;
  }

  public getAllocatedAmount(): string {
    return this.allocated_amount;
  }

  public getDescription(): string {
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

  public static create(
    id: string,
    name: string,
    budget_item_id: string,
    description: string,
    province_id: string,
    province: {
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
    } | null,
    allocated_amount: string
  ): BudGetItemDetailsEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new BudGetItemDetailsEntity(
      id,
      name,
      budget_item_id,
      description,
      province_id,
      province,
      allocated_amount,
      now,
      now,
      null
    );
  }
}
