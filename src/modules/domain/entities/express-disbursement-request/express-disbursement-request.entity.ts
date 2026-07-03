 
import { ExpressDisbursementRequestItemEntity } from "./express-disbursement-request-item.entity";
import type {
  ExpressDisbursementRequestItemParams,
  Department,
  DocumentType,
  Position,
  Requester,
  UserApproval,
  UserSignature,
  Company,
} from "@/modules/interfaces/express-disbursement-request/express-disbursement-request.interface";

/**
 * Express Disbursement Request ("ໃບສະເໜີເບີກຈ່າຍດ່ວນ").
 *
 * A single document that flows through a full, per-department-configurable
 * approval chain and, on final approval, has its budget deducted by the backend.
 * It does NOT spawn a Purchase Order or Receipt. Budget selection, slip files
 * and account code are captured progressively along the chain via /approve-step,
 * so at creation this carries only purpose + line items.
 */
export class ExpressDisbursementRequestEntity {
  private readonly id: string | null;
  private edr_number: string | null;
  private purpose: string;
  private status: string;
  private document_type: DocumentType | null;
  private department: Department | null;
  private requester: Requester | null;
  private position: Position | null;
  private company: Company | null;
  private total: number;
  private items: ExpressDisbursementRequestItemEntity[];
  private user_approval: UserApproval | null;
  private createdAt: string | null;
  private updatedAt: string | null;
  private deletedAt: string | null;

  constructor(
    id: string | null = null,
    purpose: string,
    status: string = "PENDING",
    document_type: DocumentType | null = null,
    department: Department | null = null,
    requester: Requester | null = null,
    position: Position | null = null,
    company: Company | null = null,
    user_approval: UserApproval | null = null,
    edr_number: string | null = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null,
    total: number = 0
  ) {
    this.id = id;
    this.purpose = purpose;
    this.status = status;
    this.document_type = document_type;
    this.department = department;
    this.requester = requester;
    this.position = position;
    this.company = company;
    this.user_approval = user_approval;
    this.edr_number = edr_number;
    this.total = total;
    this.items = [];
    this.createdAt = createdAt || this.getCurrentTimestamp();
    this.updatedAt = updatedAt || this.getCurrentTimestamp();
    this.deletedAt = deletedAt;
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private updateTimestamp(): void {
    this.updatedAt = this.getCurrentTimestamp();
  }

  public getId(): string | null {
    return this.id;
  }

  public getEdrNumber(): string | null {
    return this.edr_number;
  }

  public getPurpose(): string {
    return this.purpose;
  }

  public getStatus(): string {
    return this.status;
  }

  public setStatus(status: string): void {
    this.status = status;
    this.updateTimestamp();
  }

  public getTotal(): number {
    return this.total;
  }

  public setTotal(total: number): void {
    this.total = total;
  }

  public getDocumentType(): DocumentType | null {
    return this.document_type;
  }

  public getDepartment(): Department | null {
    return this.department;
  }

  public getRequester(): Requester | null {
    return this.requester;
  }

  public getRequesterSignature(): UserSignature | null {
    if (this.requester && this.requester.user_signature) {
      return this.requester.user_signature;
    }
    return null;
  }

  public getPosition(): Position | null {
    return this.position;
  }

  public getCompany(): Company | null {
    return this.company;
  }

  public getUserApproval(): UserApproval | null {
    if (
      this.user_approval &&
      typeof this.user_approval === "object" &&
      "id" in this.user_approval &&
      "approval_step" in this.user_approval
    ) {
      return this.user_approval;
    }
    return null;
  }

  public setUserApproval(userApproval: UserApproval): void {
    this.user_approval = userApproval;
    this.updateTimestamp();
  }

  public getItems(): ExpressDisbursementRequestItemEntity[] {
    return [...this.items];
  }

  public setItems(items: ExpressDisbursementRequestItemEntity[]): void {
    this.items = [...items];
    this.updateTimestamp();
  }

  public getCreatedAt(): string | null {
    return this.createdAt;
  }

  public getUpdatedAt(): string | null {
    return this.updatedAt;
  }

  public getDeletedAt(): string | null {
    return this.deletedAt;
  }

  public update(purpose: string, items?: ExpressDisbursementRequestItemEntity[]): void {
    this.purpose = purpose;
    if (items) {
      this.setItems(items);
    }
    this.updateTimestamp();
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public delete(): void {
    this.deletedAt = this.getCurrentTimestamp();
    this.updateTimestamp();
  }

  public static create(
    purpose: string,
    user_approval: UserApproval | null = null
  ): ExpressDisbursementRequestEntity {
    return new ExpressDisbursementRequestEntity(
      null,
      purpose,
      "PENDING",
      null,
      null,
      null,
      null,
      null,
      user_approval,
      null,
      null,
      null,
      null,
      0
    );
  }

  public static createWithItems(
    purpose: string,
    items: ExpressDisbursementRequestItemParams[]
  ): ExpressDisbursementRequestEntity {
    const request = ExpressDisbursementRequestEntity.create(purpose);

    const itemEntities = items.map((item) =>
      ExpressDisbursementRequestItemEntity.create(
        item.title,
        item.fileName,
        item.fileNameUrl || null,
        item.quantity,
        item.unitId.toString(),
        item.price,
        item.quantity * item.price,
        item.remark || ""
      )
    );

    request.setItems(itemEntities);
    request.setTotal(itemEntities.reduce((sum, it) => sum + it.getTotalPrice(), 0));

    return request;
  }

  public validate(): boolean {
    return (
      this.purpose.trim() !== "" &&
      Array.isArray(this.items) &&
      this.items.length > 0
    );
  }
}
