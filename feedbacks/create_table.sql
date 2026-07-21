-- 创建 feedbacks 表
-- 请在 Supabase SQL Editor 中执行此脚本

CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT DEFAULT '',
  user_phone TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引以加速查询
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);

-- 启用 RLS（Row Level Security）
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 允许已登录用户插入反馈
CREATE POLICY "Users can insert feedbacks" ON feedbacks
  FOR INSERT WITH CHECK (true);

-- 允许用户查看自己的反馈
CREATE POLICY "Users can view own feedbacks" ON feedbacks
  FOR SELECT USING (true);

-- 管理员（service role）可以执行所有操作
-- 注意：service role 绕过 RLS，无需额外策略
