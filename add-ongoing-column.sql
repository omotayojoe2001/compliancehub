-- Add is_ongoing column to track ongoing vs one-time obligations
ALTER TABLE tax_obligations 
ADD COLUMN is_ongoing BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN tax_obligations.is_ongoing IS 'True for ongoing monitoring (every month), false for one-time periods';