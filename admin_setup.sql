-- ============================================
-- 老师的小能手 - 数据库补充配置
-- 请在 Supabase SQL Editor 中执行以下全部SQL
-- ============================================

-- 1. profiles 表增加常用信息字段和管理员标记
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_region text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_textbook text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_subject text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. 开放 profiles 表的读写策略（admin.html 需要通过 service_role 操作）
-- 注意：这些策略配合 service_role key 使用，admin.html 不会暴露在公开页面
DROP POLICY IF EXISTS "admin_select_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_insert_profiles" ON public.profiles;

CREATE POLICY "admin_select_profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE USING (true);

CREATE POLICY "admin_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 3. 开放 orders 表的查询策略
DROP POLICY IF EXISTS "admin_select_orders" ON public.orders;
CREATE POLICY "admin_select_orders" ON public.orders
  FOR SELECT USING (true);
