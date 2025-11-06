import type { IDepartmentCommandRepository } from "../../../domain/repositories/IDepartmentCommandRepository.js";
import { Department } from "../../../domain/entities/Department.js";
import { DepartmentName, DepartmentCode } from "../../../domain/value-objects/index.js";
import { DepartmentDomainService } from "../../services/DepartmentDomainService.js";
import type { CreateDepartmentCommand } from "./command.js";

export interface CreateDepartmentResponse {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt: Date;
}

export class CreateDepartmentCommandHandler {
  constructor(
    private readonly departmentRepository: IDepartmentCommandRepository,
    private readonly departmentDomainService: DepartmentDomainService
  ) {}

  async handle(command: CreateDepartmentCommand): Promise<CreateDepartmentResponse> {
    const name = DepartmentName.create(command.name);
    const code = DepartmentCode.create(command.code);

    await this.departmentDomainService.ensureNameIsUnique(name);
    await this.departmentDomainService.ensureCodeIsUnique(code);

    const department = Department.create(name, command.code);

    await this.departmentRepository.save(department);

    return {
      id: department.id.getValue(),
      name: department.getName().getValue(),
      code: department.getCode().getValue(),
      isActive: department.isActive(),
      createdAt: department.createdAt,
    };
  }
}
