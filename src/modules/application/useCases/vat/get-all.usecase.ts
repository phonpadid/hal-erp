import type { VatEntity } from "@/modules/domain/entities/vat.entity";
import type { VatRepository } from "@/modules/domain/repository/vat.repository";

export class GetAllVatUseCase {
  constructor(private readonly vatRepository: VatRepository) {}
  async execute(): Promise<VatEntity> {
    return this.vatRepository.findAll();
  }
}
