import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetData() {
  console.log("🗑️  Starting data cleanup (keeping users)...\n");

  try {
    // Delete in correct order (respecting foreign key constraints)

    console.log("📋 Deleting expenses and related data...");
    await prisma.expenseTag.deleteMany({});
    await prisma.expense.deleteMany({});
    console.log("✅ Expenses deleted");

    console.log("📋 Deleting approvals...");
    await prisma.approval.deleteMany({});
    console.log("✅ Approvals deleted");

    console.log("📋 Deleting approval rules...");
    await prisma.approvalRule.deleteMany({});
    console.log("✅ Approval rules deleted");

    console.log("📋 Deleting budgets...");
    await prisma.budget.deleteMany({});
    console.log("✅ Budgets deleted");

    console.log("📋 Deleting predictions...");
    await prisma.prediction.deleteMany({});
    console.log("✅ Predictions deleted");

    console.log("📋 Deleting purchase orders...");
    await prisma.purchaseOrder.deleteMany({});
    console.log("✅ Purchase orders deleted");

    console.log("📋 Deleting inventory drops...");
    await prisma.inventoryDrop.deleteMany({});
    console.log("✅ Inventory drops deleted");

    console.log("📋 Deleting master data...");
    await prisma.tag.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.vendor.deleteMany({});
    // Delete non-system departments only
    await prisma.department.deleteMany({
      where: { isSystem: false },
    });
    console.log("✅ Tags, categories, vendors, and departments deleted");

    console.log("📋 Deleting audit logs...");
    await prisma.auditLog.deleteMany({});
    console.log("✅ Audit logs deleted");

    console.log("\n✅ Data cleanup completed successfully!");
    console.log("ℹ️  Users and system departments preserved\n");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetData()
  .then(() => {
    console.log("🎉 Ready for fresh seed!");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
