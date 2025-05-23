export class Permission {
  private id: string;
  private name: string;
  private display_name: string;
  private created_at: Date;
  private updated_at: Date;
  private deletedAt: Date | null;

  constructor(
    id: string,
    name: string,
    display_name: string,
    created_at: Date | string,
    updated_at: Date | string,
    deletedAt: Date | string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.display_name = display_name;
    this.created_at = this.parseDate(created_at);
    this.updated_at = this.parseDate(updated_at);
    this.deletedAt = deletedAt ? this.parseDate(deletedAt) : null;
  }
  private parseDate(date: Date | string): Date {
    if (date instanceof Date) return date;

    try {
      if (typeof date === "string" && date.match(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)) {
        const [datePart, timePart] = date.split(" ");
        const [day, month, year] = datePart.split("-").map(Number);
        const [hours, minutes, seconds] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }
      return new Date(date);
    } catch (error) {
      console.error(`Error parsing date: ${date}`, error);
      return new Date();
    }
  }
  public getFormattedCreatedAt(): string {
    return this.formatDate(this.created_at);
  }

  public getFormattedUpdatedAt(): string {
    return this.formatDate(this.updated_at);
  }

  public getFormattedDeletedAt(): string | null {
    return this.deletedAt ? this.formatDate(this.deletedAt) : null;
  }

  private formatDate(date: Date): string {
    try {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error(`Error formatting date: ${date}`, error);
      return "";
    }
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDisplayname(): string {
    return this.display_name;
  }

  public getcreated_at(): Date {
    return this.created_at;
  }

  public getupdated_at(): Date {
    return this.updated_at;
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public updateName(name: string): void {
    this.name = name;
    this.updated_at = new Date();
  }

  public updateDisplayName(display_name: string): void {
    this.display_name = display_name;
    this.updated_at = new Date();
  }

  public delete(): void {
    this.deletedAt = new Date();
    this.updated_at = new Date();
  }

  public restore(): void {
    this.deletedAt = null;
    this.updated_at = new Date();
  }

  public static create(id: string, name: string, display_name: string): Permission {
    const now = new Date();
    return new Permission(id, name, display_name, now, now);
  }
}
