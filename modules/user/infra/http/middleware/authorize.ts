import type { FastifyReply, FastifyRequest } from "fastify";

export async function authorizeAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  console.log("🔍 [Authorization] User from JWT:", JSON.stringify(request.user, null, 2));
  const userRole = request.user.role.toUpperCase();
  console.log("🔍 [Authorization] User role (uppercase):", userRole);
  console.log("🔍 [Authorization] Is Admin?", userRole === "ADMIN");

  if (userRole !== "ADMIN") {
    console.log("❌ [Authorization] Access denied - not an admin");
    reply.code(403).send({ error: "Forbidden: Admin access required" });
  } else {
    console.log("✅ [Authorization] Admin access granted");
  }
}

export async function authorizeManager(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const userRole = request.user.role.toUpperCase();
  const allowedRoles = ["ADMIN", "MANAGER"];
  if (!allowedRoles.includes(userRole)) {
    reply.code(403).send({ error: "Forbidden: Manager access required" });
  }
}

export async function authorizeFinance(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const userRole = request.user.role.toUpperCase();
  const allowedRoles = ["ADMIN", "FINANCE"];
  if (!allowedRoles.includes(userRole)) {
    reply.code(403).send({ error: "Forbidden: Finance access required" });
  }
}
