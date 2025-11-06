import type { Department } from "../entities/Department.js";
import type { DepartmentId } from "../value-objects/index.js";

export interface IDepartmentCommandRepository {
  save(department: Department): Promise<void>;
  update(department: Department): Promise<void>;
  delete(id: DepartmentId): Promise<void>;
  existsByName(name: string): Promise<boolean>;
  existsByNameExcludingId(name: string, excludeId: DepartmentId): Promise<boolean>;
  existsByCode(code: string): Promise<boolean>;
  existsByCodeExcludingId(code: string, excludeId: DepartmentId): Promise<boolean>;
}
