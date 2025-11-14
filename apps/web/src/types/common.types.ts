export type Status = "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FileUpload {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE" | "FINANCE";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}
