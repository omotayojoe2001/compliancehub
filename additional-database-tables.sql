-- Additional tables to complete database coverage for all features

-- Calculator templates and saved calculations
CREATE TABLE IF NOT EXISTS calculator_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  calculation_type TEXT CHECK (calculation_type IN ('vat', 'paye', 'cit', 'wht', 'capital_gains')),
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User guide progress tracking
CREATE TABLE IF NOT EXISTS guide_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id TEXT NOT NULL,
  step_id TEXT,
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, guide_id, step_id)
);

-- User bookmarks/favorites for guides
CREATE TABLE IF NOT EXISTS guide_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id TEXT NOT NULL,
  bookmarked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, guide_id)
);

-- Calculator usage analytics (for improving features)
CREATE TABLE IF NOT EXISTS calculator_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_type TEXT NOT NULL,
  input_values JSONB,
  result_value DECIMAL(12,2),
  session_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_calculator_templates_user_id ON calculator_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_templates_type ON calculator_templates(calculation_type);
CREATE INDEX IF NOT EXISTS idx_guide_progress_user_id ON guide_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_progress_guide_id ON guide_progress(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_bookmarks_user_id ON guide_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_usage_user_id ON calculator_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_usage_type ON calculator_usage(calculation_type);

-- Enable RLS
ALTER TABLE calculator_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own calculator templates" ON calculator_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own guide progress" ON guide_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own guide bookmarks" ON guide_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own calculator usage" ON calculator_usage FOR SELECT USING (auth.uid() = user_id);

-- Updated triggers
CREATE TRIGGER update_calculator_templates_updated_at BEFORE UPDATE ON calculator_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guide_progress_updated_at BEFORE UPDATE ON guide_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();