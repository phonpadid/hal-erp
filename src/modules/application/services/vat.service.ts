import type { VatRepository } from "@/modules/domain/repository/vat.repository";
import type { VatEntity } from "../../domain/entities/vat.entity";
import type { UpdateVatDTO } from "../dtos/vat.dto";
import { GetVatUseCase } from "../useCases/vat/get-vat.usecase";
import { UpdateVatUseCase } from "../useCases/vat/update-vat.usecase";
import type { VatService } from "../ports/input/vat.service";

export class VatServiceImpl implements VatService {
  private readonly getVatUseCase: GetVatUseCase;
  private readonly updateVatUseCase: UpdateVatUseCase;

  constructor(private readonly vatRepository: VatRepository) {
    this.getVatUseCase = new GetVatUseCase(vatRepository);
    this.updateVatUseCase = new UpdateVatUseCase(vatRepository);
  }

  async getVatById(id: string): Promise<VatEntity | null> {
    return await this.getVatUseCase.execute(id);
  }

  async updateVat(id: string, updateVatDTO: UpdateVatDTO): Promise<VatEntity> {
    return await this.updateVatUseCase.execute(id, updateVatDTO);
  }

  async getVat(): Promise<VatEntity | null> {
    return await this.vatRepository.findOne();
  }
}
