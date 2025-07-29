import type { UpdateVatDTO } from "../../dtos/vat.dto";
import type { VatRepository } from "@/modules/domain/repository/vat.repository";
import type { VatEntity } from "../../../domain/entities/vat.entity";

export class UpdateVatUseCase {
  constructor(private readonly vatRepository: VatRepository) {}

  async execute(id: string, updateVatDTO: UpdateVatDTO): Promise<VatEntity> {
    const vat = await this.vatRepository.findById(id);
    if (!vat) {
      throw new Error(`VAT with id ${id} not found`);
    }
    // Only update if amount is provided and changed
    if (
      updateVatDTO.amount !== undefined &&
      updateVatDTO.amount !== vat.getAmount()
    ) {
      return await this.vatRepository.update(id, updateVatDTO);
    }
    // If nothing to update, return the original entity
    return vat;
  }
}
