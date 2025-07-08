import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";
import type { UpdatePurchaseRequestDTO } from "../../dtos/purchase-requests/purchase-request.dto";

export class UpdatePurchaseRequestUseCase {
  constructor(private readonly repository: PurchaseRequestRepository) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(id: string, input: UpdatePurchaseRequestDTO): Promise<any> {
    const data = await this.repository.findById(id);
    if (!data) {
      throw new Error(` with id ${id} not found`);
    }
    // data.update(input.title);
    console.log(input);

    // return await this.repository.update(id, data);
    return
  }
}
