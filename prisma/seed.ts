import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Seed Default "General" Department (System Department)
  console.log("📂 Creating default 'General' department...");
  const generalDepartment = await prisma.department.upsert({
    where: { code: "GENERAL" },
    update: {},
    create: {
      name: "General",
      code: "GENERAL",
      isSystem: true,
      isActive: true,
    },
  });
  console.log(
    `✅ Created default department: ${generalDepartment.name} (ID: ${generalDepartment.departmentId})`
  );

  // Seed Sample Categories
  console.log("\n📁 Creating sample categories...");
  const categories = [
    { name: "Office Supplies", description: "Stationery, paper, pens, etc." },
    {
      name: "Travel",
      description: "Business travel, accommodation, transportation",
    },
    {
      name: "Software & Licenses",
      description: "Software subscriptions and licenses",
    },
    { name: "Equipment", description: "Hardware, furniture, office equipment" },
    {
      name: "Marketing",
      description: "Advertising, campaigns, promotional materials",
    },
    {
      name: "Utilities",
      description: "Internet, electricity, water, phone bills",
    },
    {
      name: "Professional Services",
      description: "Consulting, legal, accounting services",
    },
    {
      name: "Meals & Entertainment",
      description: "Client dinners, team lunches",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    console.log(`✅ Category: ${cat.name}`);
  }

  // Seed Sample Vendors
  console.log("\n🏢 Creating sample vendors...");
  const vendors = [
    {
      name: "Office Depot",
      email: "sales@officedepot.com",
      phone: "+1-800-123-4567",
    },
    { name: "Amazon Business", email: "business@amazon.com" },
    { name: "Microsoft", email: "licensing@microsoft.com" },
    { name: "Google Workspace", email: "support@google.com" },
  ];

  for (const vendor of vendors) {
    const existing = await prisma.vendor.findFirst({
      where: { name: vendor.name },
    });

    if (!existing) {
      await prisma.vendor.create({ data: vendor });
      console.log(`✅ Vendor: ${vendor.name}`);
    } else {
      console.log(`⏭️  Vendor already exists: ${vendor.name}`);
    }
  }

  // Seed Sample Users
  console.log("\n👤 Creating sample users...");
  // Hash password "password123" for all demo users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Admin User",
      email: "admin@company.com",
      password: hashedPassword,
      role: "admin" as any,
    },
    {
      name: "Finance Manager",
      email: "finance@company.com",
      password: hashedPassword,
      role: "finance" as any,
    },
    {
      name: "Department Manager",
      email: "manager@company.com",
      password: hashedPassword,
      role: "manager" as any,
    },
    {
      name: "Staff Member",
      email: "staff@company.com",
      password: hashedPassword,
      role: "staff" as any,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`✅ User: ${user.name} (${user.role})`);
  }

  console.log("\n✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
