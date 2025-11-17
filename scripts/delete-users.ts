import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userIdsToDelete = [
  "30087737-8bd5-4048-9250-f5de31d1492d",
  "65092951-099f-42a7-bc0d-46a886fd5fe7",
  "892445d6-4054-48e8-bb5a-e751a8efe21a",
  "8d96d764-0dc2-424c-aa66-1b0f0d38dad3",
  "ba248bff-8dd8-4b65-ac4c-31ee2943c918",
];

async function deleteUsers() {
  try {
    console.log("Starting user deletion process...");
    console.log(`Users to delete: ${userIdsToDelete.length}`);

    // Use a transaction to ensure all deletes succeed or all fail
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).$transaction(async (tx: any) => {
      // 1. Delete from access_token_blacklist
      const deletedBlacklist = await tx.accessTokenBlacklist.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });
      console.log(
        `✓ Deleted ${deletedBlacklist.count} access token blacklist entries`
      );

      // 2. Get all expense IDs created by these users
      const expenses = await tx.expense.findMany({
        where: { userId: { in: userIdsToDelete } },
        select: { expenseId: true },
      });
      const expenseIds = expenses.map(
        (e: { expenseId: string }) => e.expenseId
      );
      console.log(`Found ${expenseIds.length} expenses to clean up`);

      // 3. Delete approvals for these expenses
      if (expenseIds.length > 0) {
        const deletedApprovals = await tx.approval.deleteMany({
          where: { expenseId: { in: expenseIds } },
        });
        console.log(
          `✓ Deleted ${deletedApprovals.count} approvals for expenses`
        );

        // 4. Delete expense tags
        const deletedExpenseTags = await tx.expenseTag.deleteMany({
          where: { expenseId: { in: expenseIds } },
        });
        console.log(`✓ Deleted ${deletedExpenseTags.count} expense tags`);
      }

      // 5. Delete approvals done by these users (as approvers)
      const deletedApproverApprovals = await tx.approval.deleteMany({
        where: { approverId: { in: userIdsToDelete } },
      });
      console.log(
        `✓ Deleted ${deletedApproverApprovals.count} approvals done by these users`
      );

      // 6. Delete expenses
      if (expenseIds.length > 0) {
        const deletedExpenses = await tx.expense.deleteMany({
          where: { userId: { in: userIdsToDelete } },
        });
        console.log(`✓ Deleted ${deletedExpenses.count} expenses`);
      }

      // 7. Delete rewards
      const deletedRewards = await tx.reward.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });
      console.log(`✓ Deleted ${deletedRewards.count} rewards`);

      // 8. Delete audit logs
      const deletedAuditLogs = await tx.auditLog.deleteMany({
        where: { actorId: { in: userIdsToDelete } },
      });
      console.log(`✓ Deleted ${deletedAuditLogs.count} audit logs`);

      // 9. Finally, delete the users
      const deletedUsers = await tx.user.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });
      console.log(`✓ Deleted ${deletedUsers.count} users`);
    });

    console.log("\n✅ All users and related data deleted successfully!");
  } catch (error) {
    console.error("❌ Error deleting users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsers();
