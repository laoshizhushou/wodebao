# 用户反馈处理 - 定时任务说明

## 任务目标
定期检查"老师的小能手"产品的用户反馈，总结用户意见并提出优化建议。

## 执行步骤

### 1. 获取最新反馈
- 从 Supabase `feedbacks` 表查询最近的反馈记录
- 筛选条件：`created_at` 在过去 7 天内（或上次检查之后）
- 数据库配置：
  - URL: `https://hsoidekpfhbrnrytudjy.supabase.co`
  - Key: `sb_publishable_GTMbvPlzAr4CyikOikDJvg_sHT7SsgI`

### 2. 记录反馈到本地
- 将获取到的反馈保存到 `/app/data/所有对话/主对话/teacher-helper-website/feedbacks/` 目录
- 文件命名格式：`feedbacks_YYYYMMDD.md`
- 包含：用户名、手机号、反馈内容、时间

### 3. 分析与总结
对反馈内容进行分类分析：
- **功能需求**：用户希望新增或改进的功能
- **体验问题**：使用过程中的痛点和不顺畅之处
- **内容质量**：对生成内容（教案、试卷等）质量的评价
- **正面反馈**：用户认可的功能和方面

### 4. 输出优化建议
基于分析结果，输出：
- 高优先级改进项（影响面大、实现简单）
- 中期优化方向（需要规划的功能）
- 长期产品建议（战略层面的改进）

### 5. 通知
如有重要反馈或紧急问题，通过邮件通知：
- 收件人：laoshizhushou@coze.email
- 标题格式：【反馈周报】YYYY-MM-DD 用户反馈总结

## 数据库表结构
```sql
CREATE TABLE feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  user_phone TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 注意事项
- 如果 feedbacks 表尚未创建，任务应优雅地跳过并提示需要先执行建表 SQL
- 用户手机号属于敏感信息，本地记录时注意脱敏处理
- 反馈数据仅用于产品改进，不得用于其他用途
