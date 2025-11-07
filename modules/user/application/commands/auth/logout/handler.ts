import { createHash } from "crypto";
import type { PrismaClient } from "@prisma/client";
import { LogoutCommand } from "./command.js";

export class LogoutCommandHandler {
  constructor(private readonly prisma: PrismaClient) {}

  async handle(command: LogoutCommand): Promise<{ message: string }> {
    // Hash the access token for secure storage
    const tokenHash = createHash("sha256").update(command.accessToken).digest("hex");

    // Calculate token expiration (access tokens typically last 15-30 minutes)
    // We'll set expiration to 1 hour from now as a safe buffer
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Add access token to blacklist
    await this.prisma.accessTokenBlacklist.create({
      data: {
        tokenHash,
        userId: command.userId,
        expiresAt,
      },
    });

    return { message: "Logged out successfully" };
  }
}
