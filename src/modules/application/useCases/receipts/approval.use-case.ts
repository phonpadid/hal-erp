import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";
import type { IApprovalReceiptDto } from "../../dtos/receipt.dto";

export class ApprovalReceiptUseCase {
  constructor(private readonly repo: ReceiptRepository) {}

  async execute(id: number, input: IApprovalReceiptDto): Promise<IApprovalReceiptDto> {
      return await this.repo.approval(id, input);
    }
}
