export enum TagTypeEnum {
  COLLECTION = "collection",
  CAMPAIGN = "campaign",
  CUSTOM = "custom",
  DEPARTMENT = "department",
}

export interface Tag {
  tagId: string;
  name: string;
  type: TagTypeEnum;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagRequest {
  name: string;
  type: TagTypeEnum;
}

export interface UpdateTagRequest {
  name?: string;
  type?: TagTypeEnum;
}

export interface GetAllTagsParams {
  type?: TagTypeEnum;
  isActive?: boolean;
}
