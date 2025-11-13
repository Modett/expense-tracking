import type { FastifyReply, FastifyRequest } from "fastify";

interface JWTUser {
  userId: string;
  email: string;
  role: string;
}

export async function authorizeAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const userRole = (request.user as JWTUser).role.toUpperCase();

  if (userRole !== "ADMIN") {
    reply.code(403).send({ error: "Forbidden: Admin access required" });
  }
}

export async function authorizeManager(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const userRole = (request.user as JWTUser).role.toUpperCase();
  const allowedRoles = ["ADMIN", "MANAGER"];
  if (!allowedRoles.includes(userRole)) {
    reply.code(403).send({ error: "Forbidden: Manager access required" });
  }
}

export async function authorizeFinance(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const userRole = (request.user as JWTUser).role.toUpperCase();
  const allowedRoles = ["ADMIN", "FINANCE"];
  if (!allowedRoles.includes(userRole)) {
    reply.code(403).send({ error: "Forbidden: Finance access required" });
  }
}
