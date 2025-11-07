import { createHash } from "crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { PrismaClient } from "@prisma/client";

export function createAuthenticateMiddleware(prisma: PrismaClient) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      // Verify JWT
      await request.jwtVerify();

      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // Check if token is blacklisted
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const blacklistedToken = await prisma.accessTokenBlacklist.findUnique({
          where: { tokenHash },
        });

        if (blacklistedToken) {
          reply.code(401).send({ error: "Token has been revoked" });
          return;
        }
      }
    } catch (error) {
      reply.code(401).send({ error: "Unauthorized" });
    }
  };
}

// Legacy export for backwards compatibility
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.code(401).send({ error: "Unauthorized" });
  }
}
