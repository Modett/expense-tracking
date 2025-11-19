-- DropForeignKey
ALTER TABLE "public"."expenses" DROP CONSTRAINT "expenses_vendor_id_fkey";

-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "vendor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE SET NULL ON UPDATE CASCADE;
