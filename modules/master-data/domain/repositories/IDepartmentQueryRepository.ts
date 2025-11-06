import type { Department } from "../entities/Department.js";
import type { DepartmentId } from "../value-objects/index.js";

export interface DepartmentListQuery {
  limit?: number;
  offset?: number;
  isActive?: boolean;
  searchTerm?: string;
}

export interface IDepartmentQueryRepository {
  findById(id: DepartmentId): Promise<Department | null>;
  findAll(query: DepartmentListQuery): Promise<Department[]>;
  findByName(name: string): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  findActiveDepartments(limit?: number, offset?: number): Promise<Department[]>;
  searchDepartments(searchTerm: string, limit?: number, offset?: number): Promise<Department[]>;
  count(filters?: { isActive?: boolean }): Promise<number>;
}
