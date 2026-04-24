# Bazi Master App - 项目状态

最后更新：2026-04-24
当前阶段：Stage 1 ✅ 完成，准备进入 Stage 2

---

## 技术栈

Next.js 16 App Router + TypeScript + Tailwind CSS + Turbopack · Supabase (Auth + DB) · @google/genai 1.50.1 (Gemini) · undici (代理) · OpenCage Geocoding API · Vercel（目标，尚未部署）

---

## 环境变量（.env.local）

```
NEXT_PUBLIC_SUPABASE_URL=https://cadedntyqimpqabgkrtg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
OPENCAGE_API_KEY=e02ba1c8f7b246628133d374d1b568fe
GEMINI_API_KEY=...
HTTPS_PROXY=http://127.0.0.1:10808   # 本地开发用，生产不设
```

---

## 关键文件结构

```
D:\bazi-master\bazi-app
├── instrumentation.ts              # undici ProxyAgent 全局代理注入
├── proxy.ts                        # Next.js 16 session 刷新（替代 middleware.ts）
├── app/
│   ├── layout.tsx
│   ├── globals.css                 # 设计 token、AI 报告样式、向导样式
│   ├── login/                      # Magic Link 登录页
│   ├── auth/callback/              # Supabase 回调
│   ├── dashboard/                  # 档案列表 + 状态角标
│   ├── profiles/
│   │   ├── new/                    # 6 步建档向导（ProfileForm + Step1-6）
│   │   └── [id]/                   # 详情页 + BaseReportSection + actions.ts
│   └── api/geocode/                # OpenCage 城市搜索代理
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # 浏览器客户端
│   │   └── server.ts               # 服务端客户端 + createAdminClient()
│   ├── bazi/
│   │   ├── lunar.js                # 🔴 红线：禁止修改
│   │   ├── bazi-calculator-logic.js # 🔴 红线：禁止修改
│   │   └── chart-helpers.ts        # 干支/五行/太岁工具函数
│   ├── ai/
│   │   ├── gemini-client.ts        # GoogleGenAI 单例
│   │   ├── bazi-prompt.ts          # 8 语言 prompt 构建
│   │   └── generate-report.ts      # 异步生成管线（after() 触发）
│   └── markdown/
│       └── renderer.ts             # 零依赖 markdown → HTML 渲染器
└── DESIGN_TOKENS.md                # 视觉圣经，所有 UI 以此为准
```

---

## 数据库 Schema

### `profiles` 表（Stage 1 完整状态）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | → auth.users |
| name | text | |
| relation | text | self / family / friend / other |
| gender | text | male / female |
| birth_date | date | |
| birth_time | time | nullable（时辰不明时为 null） |
| is_time_unknown | boolean | default false |
| birth_city | text | nullable |
| longitude | float8 | nullable |
| timezone_offset_sec | int4 | nullable |
| pillar_year | text | 年柱干支 |
| pillar_month | text | 月柱干支 |
| pillar_day | text | 日柱干支 |
| pillar_hour | text | 时柱干支，nullable |
| day_master | text | 日主天干 |
| day_master_element | text | 日主五行（英文） |
| five_elements | jsonb | {wood, fire, earth, metal, water: number} |
| lunar_date | text | 农历日期字符串 |
| true_solar_time | timestamptz | nullable，经真太阳时校准后的时间 |
| zodiac | text | 生肖（中文，如"狗"） |
| luck_cycles | jsonb | StoredLuckCycle[] |
| base_report | text | AI 生成的完整报告（markdown） |
| base_report_language | text | default 'en'，8 种语言 |
| base_report_status | text | default 'pending'；值：pending / generating / done / failed |
| base_report_error | text | nullable，失败时写入错误信息 |
| base_report_generated_at | timestamptz | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | auto-updated by trigger |

### `questions` 表（Stage 2 待激活）

用于"一事一问"功能：profile_id、user_id、question (text)、answer (text)、created_at。RLS 策略与 profiles 表一致。

---

## Stage 1 已完成

- Magic Link 登录 + 会话管理
- 6 步建档向导（relation → name → gender → birth → city → language），self/other 文案自动切换
- 真太阳时校准（经度偏差 + 均时差方程）
- 四柱八字计算 + 五行分布 + 大运/流年（lib/bazi/，不可动）
- Gemini 3.1 Flash-Lite 异步 AI 报告生成，`after()` 后台触发，状态写回 DB
- Dashboard 档案列表，status badge（pending/generating/done/failed）
- 详情页：四柱 / 五行 / 大运 / AI 报告，3 秒轮询 + 失败重试
- 零依赖 markdown 渲染器（[[术语]] 红色 / **关键词** 金色 / ## 标题层级）

---

## Stage 2 待做（按优先级）

1. **详情页布局重构**：左侧栏 + 右侧动态主视图，替换当前竖向卡片堆叠
2. **今日黄历**：基于档案日主 + 当天流日给今日建议
3. **一事一问**：自由提问 + AI 回答 + 存 questions 表
4. **Gemini Pro 付费升级路径**
5. **RLS 重开 + 精确策略**（目前 RLS 已关，写操作靠 admin key）
6. **Vercel 部署 + 接 app.bazi-master.com 域名**

---

## 产品红线

- 没有邮箱 gate / teaser / upsell，登录即得完整报告
- 商业化走 SaaS 订阅 + Pro 模型升级，不走 B2C 漏斗
- UI 英文，8 种报告语言可选
- 禅意品牌，`DESIGN_TOKENS.md` 为视觉圣经，色值/字体/组件不得擅改

---

## 开新对话 / 新 Claude Code session 的冷启动

必读顺序：
1. `PROJECT_STATUS.md`（本文件）——当前状态 + 下一步
2. `CLAUDE.md`——Stage 1 踩坑清单 + 协作硬规则（含 AGENTS.md 的 Next.js 16 警告）
3. `DESIGN_TOKENS.md`——所有 UI 改动的视觉基准

任何代码改动必须走：**Phase 0（只读 + 计划）→ 用户 review → Phase 1（改动）→ tsc 验证** 流程。
