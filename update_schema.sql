-- ========== 老师的小能手 - 数据库更新脚本 ==========
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. profiles表增加email字段（用于接收生成结果）
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE profiles ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- 2. 创建充值请求表
CREATE TABLE IF NOT EXISTS recharge_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    phone TEXT,
    name TEXT,
    package_count INTEGER,
    amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 3. 创建生成结果表
CREATE TABLE IF NOT EXISTS generated_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    form_data JSONB DEFAULT '{}',
    result_content TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','confirmed','rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ
);

-- 4. RLS策略 - recharge_requests
ALTER TABLE recharge_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rrq_select ON recharge_requests;
CREATE POLICY rrq_select ON recharge_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS rrq_insert ON recharge_requests;
CREATE POLICY rrq_insert ON recharge_requests FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS rrq_update ON recharge_requests;
CREATE POLICY rrq_update ON recharge_requests FOR UPDATE USING (true);

-- 5. RLS策略 - generated_results
ALTER TABLE generated_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gr_select ON generated_results;
CREATE POLICY gr_select ON generated_results FOR SELECT USING (true);
DROP POLICY IF EXISTS gr_insert ON generated_results;
CREATE POLICY gr_insert ON generated_results FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS gr_update ON generated_results;
CREATE POLICY gr_update ON generated_results FOR UPDATE USING (true);
