import type { VatRepository } from "@/modules/domain/repository/vat.repository";
import type { VatEntity } from "../../../domain/entities/vat.entity";

export class GetVatUseCase {
  constructor(private readonly vatRepository: VatRepository) {}

  async execute(id: string): Promise<VatEntity> {
    const vat = await this.vatRepository.findById(id);
    if (!vat) {
      throw new Error(`VAT with id ${id} not found`);
    }
    return vat;
  }
}
