export const userSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["staff", "manager", "finance", "admin"] },
    status: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const authResponseSchema = {
  type: "object",
  properties: {
    accessToken: { type: "string" },
    refreshToken: { type: "string" },
    user: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        email: { type: "string", format: "email" },
        role: { type: "string" },
      },
    },
  },
} as const;

export const errorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
  },
} as const;

export const messageSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
} as const;
