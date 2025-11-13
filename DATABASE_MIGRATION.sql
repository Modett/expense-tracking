-- Add budget enforcement fields to budgets table
ALTER TABLE budgets 
ADD COLUMN enforcement_type VARCHAR(10) DEFAULT 'soft',
ADD COLUMN override_allowed BOOLEAN DEFAULT true,
ADD COLUMN warning_threshold_1 INTEGER DEFAULT 80,
ADD COLUMN warning_threshold_2 INTEGER DEFAULT 90,
ADD COLUMN critical_threshold INTEGER DEFAULT 100;

-- Add check constraint to ensure threshold ordering
ALTER TABLE budgets 
ADD CONSTRAINT check_threshold_order 
CHECK (
  warning_threshold_1 >= 0 AND warning_threshold_1 <= 100 AND
  warning_threshold_2 >= 0 AND warning_threshold_2 <= 100 AND
  critical_threshold >= 0 AND critical_threshold <= 100 AND
  warning_threshold_1 < warning_threshold_2 AND
  warning_threshold_2 <= critical_threshold
);

-- Add check constraint for enforcement type
ALTER TABLE budgets 
ADD CONSTRAINT check_enforcement_type 
CHECK (enforcement_type IN ('soft', 'hard'));

-- Add comment for documentation
COMMENT ON COLUMN budgets.enforcement_type IS 'Budget enforcement: soft (warning only) or hard (blocking)';
COMMENT ON COLUMN budgets.override_allowed IS 'Whether budget overrides are allowed';
COMMENT ON COLUMN budgets.warning_threshold_1 IS 'First warning threshold percentage (default 80%)';
COMMENT ON COLUMN budgets.warning_threshold_2 IS 'Second warning threshold percentage (default 90%)';
COMMENT ON COLUMN budgets.critical_threshold IS 'Critical alert threshold percentage (default 100%)';
