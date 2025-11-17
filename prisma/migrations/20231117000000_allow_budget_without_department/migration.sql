-- Allow budgets without a department by making department_id nullable
ALTER TABLE "budgets"
    ALTER COLUMN "department_id" DROP NOT NULL;
