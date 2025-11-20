-- DropForeignKey
ALTER TABLE "public"."approval_rules" DROP CONSTRAINT "approval_rules_category_id_fkey";

-- AlterTable
ALTER TABLE "approval_rules" ADD COLUMN     "department_id" UUID,
ALTER COLUMN "category_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "approval_rules" ADD CONSTRAINT "approval_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_rules" ADD CONSTRAINT "approval_rules_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;
