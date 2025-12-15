import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";
import type { IApprovalReceiptDto } from "../../dtos/receipt.dto";

export class ApprovalhalReceiptUseCase {
  constructor(private readonly repo: ReceiptRepository) {}

  async execute(input: IApprovalReceiptDto): Promise<IApprovalReceiptDto> {
      return await this.repo.approvalhal(input);
    }
}