-- Add tax_period column to track specific tax periods
ALTER TABLE tax_obligations 
ADD COLUMN tax_period VARCHAR(7); -- Format: YYYY-MM

-- Add comment for clarity
COMMENT ON COLUMN tax_obligations.tax_period IS 'Tax period in YYYY-MM format (e.g., 2024-12 for December 2024)';