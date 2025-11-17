export enum RoleEnum {
  STAFF = "staff",
  MANAGER = "manager",
  FINANCE = "finance",
  ADMIN = "admin",
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: RoleEnum;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: RoleEnum;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: RoleEnum;
}

export interface GetAllUsersParams {
  role?: RoleEnum;
  isActive?: boolean;
}
