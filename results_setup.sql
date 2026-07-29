-- 创建 generated_results 表
CREATE TABLE IF NOT EXISTS generated_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT,
  form_data JSONB,
  result_content TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ
);

ALTER TABLE generated_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "results_select" ON generated_results;
DROP POLICY IF EXISTS "results_insert" ON generated_results;
DROP POLICY IF EXISTS "results_update" ON generated_results;

CREATE POLICY "results_select" ON generated_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "results_insert" ON generated_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "results_update" ON generated_results
  FOR UPDATE USING (auth.uid() = user_id);
