-- Create how-to guides table
CREATE TABLE IF NOT EXISTS guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  youtube_video_id TEXT, -- YouTube video ID
  requirements TEXT[], -- Array of requirements
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guide steps table
CREATE TABLE IF NOT EXISTS guide_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guide_id, step_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guides_published ON guides(is_published);
CREATE INDEX IF NOT EXISTS idx_guide_steps_guide_id ON guide_steps(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_steps_order ON guide_steps(guide_id, step_number);

-- Enable RLS (Row Level Security)
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for guides (public read, admin write)
CREATE POLICY "Anyone can view published guides" ON guides
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admin can manage guides" ON guides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (business_type = 'admin' OR id = '550e8400-e29b-41d4-a716-446655440000')
    )
  );

-- Create policies for guide_steps (public read, admin write)
CREATE POLICY "Anyone can view steps of published guides" ON guide_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guides 
      WHERE guides.id = guide_steps.guide_id 
      AND guides.is_published = true
    )
  );

CREATE POLICY "Admin can manage guide steps" ON guide_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (business_type = 'admin' OR id = '550e8400-e29b-41d4-a716-446655440000')
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();