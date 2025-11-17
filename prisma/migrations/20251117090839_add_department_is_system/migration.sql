/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `vendors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gst_number]` on the table `vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "expense_priority_enum" AS ENUM ('routine', 'standard', 'urgent', 'emergency');

-- CreateEnum
CREATE TYPE "budget_exception_type_enum" AS ENUM ('none', 'emergency', 'annual', 'recurring');

-- DropForeignKey
ALTER TABLE "public"."budgets" DROP CONSTRAINT "budgets_department_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."expenses" DROP CONSTRAINT "expenses_department_id_fkey";

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "critical_threshold" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "enforcement_type" TEXT NOT NULL DEFAULT 'soft',
ADD COLUMN     "override_allowed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "warning_threshold_1" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "warning_threshold_2" INTEGER NOT NULL DEFAULT 90;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "approval_deadline" TIMESTAMPTZ(6),
ADD COLUMN     "budget_override" "budget_exception_type_enum" NOT NULL DEFAULT 'none',
ADD COLUMN     "justification" TEXT,
ADD COLUMN     "priority" "expense_priority_enum" NOT NULL DEFAULT 'standard',
ALTER COLUMN "department_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "vendors_name_key" ON "vendors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_gst_number_key" ON "vendors"("gst_number");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;
