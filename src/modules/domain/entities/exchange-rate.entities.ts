import { formatDate } from "@/modules/shared/formatdate";
import type { CurrencyEntity } from "./currency.entity";

export class ExchangeRateEntity {
  private id: string | null;
  private from_currency_id: number;
  private to_currency_id: number;
  private rate: number;
  private is_active: boolean | null;
  private from_currency: CurrencyEntity | null;
  private to_currency: CurrencyEntity | null;

  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null;

  constructor(
    id: string | null = null,
    from_currency_id: number,
    to_currency_id: number,
    rate: number,
    is_active: string | boolean | null = null,
    from_currency: CurrencyEntity | null = null,
    to_currency: CurrencyEntity | null = null,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.from_currency_id = from_currency_id;
    this.to_currency_id = to_currency_id;
    this.rate = rate;

    if (typeof is_active === "string") {
      this.is_active = is_active === "true";
    } else if (typeof is_active === "boolean") {
      this.is_active = is_active;
    } else {
      this.is_active = false;
    }

    this.from_currency = from_currency;
    this.to_currency = to_currency;
    this.createdAt = formatDate(createdAt);
    this.updatedAt = formatDate(updatedAt);
    this.deletedAt = deletedAt !== null ? formatDate(deletedAt) : null;
  }

  public getId(): string | null {
    return this.id;
  }

  public getFromCurrencyId(): number {
    return this.from_currency_id;
  }

  public getToCurrencyId(): number {
    return this.to_currency_id;
  }

  public getRate(): number {
    return this.rate;
  }

  public getIsActive(): boolean | null {
    return this.is_active;
  }

  public getFromCurrency(): CurrencyEntity | null {
    return this.from_currency;
  }

  public getToCurrency(): CurrencyEntity | null {
    return this.to_currency;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public getUpdatedAt(): string {
    return this.updatedAt;
  }

  public getDeletedAt(): string | null {
    return this.deletedAt;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public updateData(
    from_currency_id: number,
    to_currency_id: number,
    rate: number,
    is_active: boolean
  ): void {
    this.from_currency_id = from_currency_id;
    this.to_currency_id = to_currency_id;
    this.rate = rate;
    this.is_active = is_active;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public delete(): void {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.deletedAt = now;
    this.updatedAt = now;
  }

  public static create(
    from_currency_id: number,
    to_currency_id: number,
    rate: number
  ): ExchangeRateEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new ExchangeRateEntity(
      null,
      from_currency_id,
      to_currency_id,
      rate,
      true,
      null,
      null,
      now,
      now,
      null
    );
  }
}
