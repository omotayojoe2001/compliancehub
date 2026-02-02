-- Create how-to guides table
CREATE TABLE IF NOT EXISTS howto_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subheading TEXT,
  duration INTEGER, -- in minutes
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  youtube_video_id TEXT, -- YouTube video ID (e.g., 'dQw4w9WgXcQ' from https://www.youtube.com/watch?v=dQw4w9WgXcQ)
  requirements TEXT[], -- Array of requirements
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guide steps table
CREATE TABLE IF NOT EXISTS howto_guide_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID REFERENCES howto_guides(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guide_id, step_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_howto_guides_published ON howto_guides(is_published);
CREATE INDEX IF NOT EXISTS idx_howto_guide_steps_guide_id ON howto_guide_steps(guide_id);
CREATE INDEX IF NOT EXISTS idx_howto_guide_steps_order ON howto_guide_steps(guide_id, step_number);

-- Enable RLS (Row Level Security)
ALTER TABLE howto_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE howto_guide_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for guides (public read, admin write)
CREATE POLICY "Anyone can view published guides" ON howto_guides
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admin can manage guides" ON howto_guides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (business_type = 'admin' OR email = 'admin@taxandcompliance.com')
    )
  );

-- Create policies for guide_steps (public read, admin write)
CREATE POLICY "Anyone can view steps of published guides" ON howto_guide_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM howto_guides 
      WHERE howto_guides.id = howto_guide_steps.guide_id 
      AND howto_guides.is_published = true
    )
  );

CREATE POLICY "Admin can manage guide steps" ON howto_guide_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (business_type = 'admin' OR email = 'admin@taxandcompliance.com')
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

CREATE TRIGGER update_howto_guides_updated_at BEFORE UPDATE ON howto_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO howto_guides (title, description, subheading, duration, difficulty_level, youtube_video_id, requirements, is_published) VALUES
('VAT Registration Process', 'Complete guide to register for VAT in Nigeria', 'Step-by-step VAT registration', 15, 'beginner', 'dQw4w9WgXcQ', ARRAY['Valid business registration', 'Tax identification number', 'Bank account details'], true),
('Monthly VAT Returns', 'How to file your monthly VAT returns', 'Filing VAT returns made easy', 20, 'intermediate', 'dQw4w9WgXcQ', ARRAY['VAT registration certificate', 'Monthly sales records', 'Purchase invoices'], true);

-- Insert sample steps
INSERT INTO howto_guide_steps (guide_id, step_number, title, content) 
SELECT id, 1, 'Gather Required Documents', 'Collect all necessary documents including business registration certificate, tax identification number, and bank account details.'
FROM howto_guides WHERE title = 'VAT Registration Process';

INSERT INTO howto_guide_steps (guide_id, step_number, title, content) 
SELECT id, 2, 'Visit FIRS Office', 'Go to the nearest Federal Inland Revenue Service office with your documents.'
FROM howto_guides WHERE title = 'VAT Registration Process';

INSERT INTO howto_guide_steps (guide_id, step_number, title, content) 
SELECT id, 3, 'Complete Application Form', 'Fill out the VAT registration application form completely and accurately.'
FROM howto_guides WHERE title = 'VAT Registration Process';