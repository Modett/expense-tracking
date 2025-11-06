import type { IDepartmentCommandRepository } from "../../domain/repositories/IDepartmentCommandRepository.js";
import type { DepartmentId, DepartmentName, DepartmentCode } from "../../domain/value-objects/index.js";

export class DepartmentDomainService {
  constructor(private readonly departmentRepository: IDepartmentCommandRepository) {}

  async ensureNameIsUnique(name: DepartmentName): Promise<void> {
    const exists = await this.departmentRepository.existsByName(name.getValue());
    if (exists) {
      throw new Error(`Department with name "${name.getValue()}" already exists`);
    }
  }

  async ensureNameIsUniqueForUpdate(
    name: DepartmentName,
    currentDepartmentId: DepartmentId
  ): Promise<void> {
    const exists = await this.departmentRepository.existsByNameExcludingId(
      name.getValue(),
      currentDepartmentId
    );
    if (exists) {
      throw new Error(`Department with name "${name.getValue()}" already exists`);
    }
  }

  async ensureCodeIsUnique(code: DepartmentCode): Promise<void> {
    const codeValue = code.getValue();
    if (!codeValue) return; // Skip validation if code is null/empty

    const exists = await this.departmentRepository.existsByCode(codeValue);
    if (exists) {
      throw new Error(`Department with code "${codeValue}" already exists`);
    }
  }

  async ensureCodeIsUniqueForUpdate(
    code: DepartmentCode,
    currentDepartmentId: DepartmentId
  ): Promise<void> {
    const codeValue = code.getValue();
    if (!codeValue) return; // Skip validation if code is null/empty

    const exists = await this.departmentRepository.existsByCodeExcludingId(
      codeValue,
      currentDepartmentId
    );
    if (exists) {
      throw new Error(`Department with code "${codeValue}" already exists`);
    }
  }
}
