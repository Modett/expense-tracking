import type { IDepartmentCommandRepository } from "../../../domain/repositories/IDepartmentCommandRepository.js";
import type { IDepartmentQueryRepository } from "../../../domain/repositories/IDepartmentQueryRepository.js";
import { DepartmentId, DepartmentName, DepartmentCode } from "../../../domain/value-objects/index.js";
import { DepartmentDomainService } from "../../services/DepartmentDomainService.js";
import type { UpdateDepartmentCommand } from "./command.js";

export interface UpdateDepartmentResponse {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
  updatedAt: Date;
}

export class UpdateDepartmentCommandHandler {
  constructor(
    private readonly departmentRepository: IDepartmentCommandRepository,
    private readonly departmentQueryRepository: IDepartmentQueryRepository,
    private readonly departmentDomainService: DepartmentDomainService
  ) {}

  async handle(command: UpdateDepartmentCommand): Promise<UpdateDepartmentResponse> {
    const departmentId = DepartmentId.fromString(command.id);
    const name = DepartmentName.create(command.name);
    const code = DepartmentCode.create(command.code);

    const department = await this.departmentQueryRepository.findById(departmentId);
    if (!department) {
      throw new Error(`Department with id "${command.id}" not found`);
    }

    await this.departmentDomainService.ensureNameIsUniqueForUpdate(name, departmentId);
    await this.departmentDomainService.ensureCodeIsUniqueForUpdate(code, departmentId);

    department.update(name, command.code);

    await this.departmentRepository.update(department);

    return {
      id: department.id.getValue(),
      name: department.getName().getValue(),
      code: department.getCode().getValue(),
      isActive: department.isActive(),
      updatedAt: department.updatedAt,
    };
  }
}
