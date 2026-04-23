# Bazi Master — Design Tokens & Brand Guidelines

**重要**：此文档是 Bazi Master 应用的视觉圣经。所有 UI 开发必须严格遵循。品牌风格定位为**东方禅意美学（Zen Aesthetic）**，区别于常规 SaaS 产品的极简灰白风。

---

## 设计哲学

- **宣纸 + 水墨 + 朱砂 + 金** 四元素构成品牌 DNA
- 不用纯白，不用纯黑——用暖米黄和水墨灰,避免锐利冷感
- 中英双语优雅并存,衬线字体彰显庄重
- 传统中式元素（印章、圆印、暗纹）以现代手法呈现,不俗气不复古过度

---

## 色彩系统（CSS Variables）

在 `app/globals.css` 的 `:root` 里定义：

```css
:root {
  /* === 品牌主色 === */
  --zen-bg: #F9F7F2;           /* 宣纸底色,所有页面主背景 */
  --zen-ink: #2c2c2c;          /* 水墨黑,所有主文字 */
  --zen-red: #BC2D2D;          /* 朱砂红,印章/强调/CTA */
  --zen-red-dark: #a02424;     /* 朱砂红边框/深色变体 */
  --zen-gold: #B8860B;         /* 暗金色,装饰线/次级强调 */
  --zen-gold-light: #D4AF37;   /* 亮金色,高光渐变用 */
  --zen-paper: #ffffff;        /* 纯白卡片底(但要配宣纸边框) */
  --zen-border: #dcd9d1;       /* 宣纸边框色,所有边框用这个 */
  
  /* === 五行色（严格不可改）=== */
  --element-wood: #4A7C59;     /* 木,深竹绿 */
  --element-fire: #C74B4B;     /* 火,火焰红 */
  --element-earth: #B8860B;    /* 土,与暗金同色 */
  --element-metal: #8B8B8B;    /* 金,银灰 */
  --element-water: #4A6FA5;    /* 水,深海蓝 */
  
  /* === 文字辅助色 === */
  --zen-text-muted: #888;      /* 次要文字/标签 */
  --zen-text-light: #999;      /* 最次要文字/帮助文本 */
  --zen-text-placeholder: #aaa;/* 禁用/占位符 */
}
```

### 使用约定
- **主页面背景**：用 `var(--zen-bg)`,**绝不用** `bg-white` 或 `bg-gray-50`
- **主文字**：用 `var(--zen-ink)`,**绝不用** `text-black`
- **按钮/边框**：用 `var(--zen-ink)` 或 `var(--zen-red)`
- **卡片内部底色**：可以用白色,但配宣纸色边框 `var(--zen-border)`

---

## 字体系统

### 引入 (在 `app/layout.tsx` 或全局 CSS 顶部)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+TC:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CSS 变量

```css
:root {
  /* 主字体：标题、品牌感强的地方 */
  --font-main: 'Playfair Display', 'Noto Serif SC', 'Noto Serif TC', serif;
  
  /* UI 字体：标签、按钮、表单、小字 */
  --font-ui: 'DM Sans', 'Helvetica Neue', sans-serif;
  
  /* 印章字体：八字汉字显示必须用衬线 */
  --font-seal: 'Noto Serif SC', 'Noto Serif TC', serif;
}
```

### 使用约定
- **H1/H2 标题**：`font-family: var(--font-main)`, 字重 600-700, 字间距 `letter-spacing: 0.1em`
- **按钮文字**：`font-family: var(--font-main)`, 大写 `text-transform: uppercase`, 字间距 `0.2em`
- **表单标签**：`font-family: var(--font-ui)`, 12px, 大写, 字间距 `0.1em`, 颜色 `var(--zen-text-muted)`
- **八字汉字**：`font-family: var(--font-seal)`, 1.6rem+, 字重 700, 颜色 `var(--zen-red)`,字间距 3px

---

## 标志性视觉元素（强制使用）

### 1. 红色印章 `.zen-seal`

这是**品牌灵魂**,所有带品牌标识的地方必须用。

```css
.zen-seal {
  width: 48px;
  height: 48px;
  background-color: var(--zen-red);
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  border: 2px solid var(--zen-red-dark);
  box-shadow: inset 0 0 5px rgba(0,0,0,0.3);
  font-family: var(--font-seal);
}
```

**使用场景**：
- 页面 Header 左上角(代替 logo)
- 登录页主视觉
- 档案详情页顶部"八字"标识
- 印章内文字根据场景调整:"八字"、"命"、"运"等单字或两字

### 2. 宣纸纹理背景 `.zen-paper-bg`

主内容区域底色,叠加细微暗纹。

```css
.zen-paper-bg {
  background-color: var(--zen-bg);
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dcd9d1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
```

**使用场景**：页面根容器 `<body>` 或最外层 wrapper 必须用此背景。

### 3. 水墨圆印 `.zen-circle-bg`

装饰元素,页面顶部居中,营造仪式感。

```css
.zen-circle-bg {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  border: 1px solid rgba(44, 44, 44, 0.05);
  background-color: rgba(188, 45, 45, 0.02);
  pointer-events: none;
  z-index: 0;
}

/* 移动端缩小 */
@media (max-width: 800px) {
  .zen-circle-bg { width: 300px; height: 300px; }
}
```

**使用场景**：登录页、档案详情页、任何需要仪式感的页面。放在 `relative` 容器里,内容 `z-index: 10`。

### 4. 禅意输入框（下划线式）

**绝对不要用常规的圆角边框输入框**（Tailwind 默认那种）。本品牌用**纸上书写式**的下划线输入。

```css
.zen-input {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 2px solid #e0e0e0;
  background: transparent;
  font-family: var(--font-main);
  font-size: 18px;
  color: var(--zen-ink);
  border-radius: 0;  /* 必须无圆角 */
  transition: all 0.3s ease;
}

.zen-input:focus {
  outline: none;
  border-bottom-color: var(--zen-ink);
  background: rgba(255,255,255,0.5);
}

.zen-input:disabled {
  background-color: #f5f5f5;
  color: var(--zen-text-placeholder);
  border-bottom-style: dashed;
  border-bottom-color: #ccc;
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 5. 禅意按钮 `.zen-btn`

```css
.zen-btn {
  background: transparent;
  border: 2px solid var(--zen-ink);
  padding: 14px 48px;
  font-family: var(--font-main);
  font-size: 1.1rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.4s ease;
  color: var(--zen-ink);
}

.zen-btn:hover {
  background-color: var(--zen-ink);
  color: var(--zen-bg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

/* 主 CTA 变体(用于付费、重要转化) */
.zen-btn-primary {
  background: linear-gradient(135deg, var(--zen-red) 0%, var(--zen-red-dark) 100%);
  color: white;
  border: none;
  /* 其余同 .zen-btn */
}
```

### 6. 禅意卡片 `.zen-card`

```css
.zen-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(44, 44, 44, 0.1);
  padding: 40px;
  box-shadow: 0 10px 30px rgba(44, 44, 44, 0.05);
  /* 注意:无圆角或极小圆角,保持纸质感 */
}

/* 结果展示卡片(白底) */
.zen-result-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}
```

### 7. 金色分隔小标题 `.zen-heading-sm`

段落标题的标志性样式:

```css
.zen-heading-sm {
  font-family: var(--font-main);
  font-size: 20px;
  border-bottom: 2px solid var(--zen-gold);
  padding-bottom: 8px;
  margin-bottom: 16px;
  display: inline-block;
  color: var(--zen-ink);
}
```

---

## 八字结果展示组件

### 四柱卡片 `.bazi-pillar-card`

```css
.bazi-pillar-card {
  background: linear-gradient(135deg, #fff 0%, #faf9f7 100%);
  border: 1px solid rgba(188, 45, 45, 0.2);
  border-radius: 8px;
  padding: 16px 20px;
  text-align: center;
  min-width: 80px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.bazi-pillar-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.bazi-pillar-card.pillar-unknown {
  background: #f5f5f5;
  border-style: dashed;
  opacity: 0.7;
}

.bazi-pillar-chars {
  font-family: var(--font-seal);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--zen-red);
  letter-spacing: 3px;
  margin-bottom: 6px;
}

.bazi-pillar-label {
  font-family: var(--font-ui);
  font-size: 11px;
  color: var(--zen-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

### 五行进度条 `.element-*`

每个五行有专属圆形图标 + 百分比条。结构参考 V8.5 calculator 实现 (`.five-elements-bars`, `.element-item`, `.element-icon`, `.element-bar`)。

图标大小 36px 圆形,填色用 `var(--element-*)`,中文字(木火土金水)白色显示。

---

## 禁用清单（绝不出现）

- ❌ `bg-white` 作为主背景(用 `var(--zen-bg)`)
- ❌ `text-black` 作为主文字(用 `var(--zen-ink)`)
- ❌ `bg-blue-500`、`bg-indigo-*` 等 Tailwind 品牌色(Bazi Master 只用朱砂红)
- ❌ 大圆角 `rounded-xl`、`rounded-2xl`(最大用 `rounded`,即 4-8px,保持纸质硬朗感)
- ❌ Tailwind 默认 input (`border border-gray-300 rounded`)——必须用 `.zen-input` 下划线式
- ❌ 玻璃拟态 (glassmorphism) 的彩色渐变——只允许极淡的白/米色磨砂
- ❌ 霓虹色、荧光色、紫色渐变——与品牌气质完全冲突
- ❌ Emoji 作为品牌/功能图标——用 Lucide icons 或纯 CSS 符号(✓ + × 等)

---

## 布局原则

### 页面结构模板

```tsx
<div className="zen-paper-bg min-h-screen relative overflow-hidden">
  <div className="zen-circle-bg"></div>  {/* 装饰圆印 */}
  
  <div className="relative z-10 max-w-[800px] mx-auto px-4 py-16">
    {/* 页面 Header:印章 + 标题居中 */}
    <div className="flex flex-col items-center mb-10">
      <div className="zen-seal mb-4">
        <span>八字</span>
      </div>
      <h1 className="zen-h1">Page Title</h1>
      <p className="zen-subtitle">Subtitle In Caps Letter Spacing</p>
    </div>
    
    {/* 主内容卡片 */}
    <div className="zen-card">
      {/* ... */}
    </div>
  </div>
</div>
```

### 间距节奏

- 页面上下 padding: `60px-80px`
- 卡片内部 padding: `30-40px`
- 表单组之间 `margin-bottom: 24px`
- 小元素之间 `gap: 12-20px`

### 响应式断点

```css
@media (max-width: 900px) { /* 平板 */ }
@media (max-width: 800px) { /* 大手机/横屏 */ }
@media (max-width: 600px) { /* 手机 */ }
```

---

## 应用到具体页面的建议

### 登录页 `/login`
- 宣纸背景 + 水墨圆印
- 居中印章 "八" 或 "命"
- 标题 "Bazi Master",副标题 "Enter your email to continue"
- 下划线式邮箱输入框
- `.zen-btn` 样式的 "Send Magic Link" 按钮
- 底部小字说明

### Dashboard `/dashboard`
- 顶部 Header 左侧小印章 + "Bazi Master" 品牌名,右侧用户 email + Logout
- 主区域:"Your Profiles" 金色下划线标题
- 档案列表用 `.zen-result-card` 变体,每张卡片含姓名、日主(朱砂红汉字)、生肖、创建日期
- "+ Create New Profile" 按钮用 `.zen-btn` 样式

### 建档表单 `/profiles/new`
- 沿用 V8.5 calculator 的表单结构(下划线输入框、三列日期选择、禅意复选框)
- 城市自动完成下拉样式参考 `.city-suggestions`
- 提交按钮 "Create Profile" 或 "Reveal Destiny"

### 档案详情 `/profiles/[id]`
- 顶部大印章 + 档案姓名
- 四柱卡片组(四柱或三柱,时柱未知时样式 `.pillar-unknown`)
- 五行分布进度条
- 基本信息表格(公历、农历、性别、出生地、真太阳时校准显示)
- AI 报告区块(使用 `.ai-content-box` 样式,朱砂红专业术语、金色分节线)

---

## 文件实现建议

1. **第一步**:把本文件所有 CSS 变量和基础类写入 `app/globals.css`
2. **第二步**:所有组件优先使用这些全局 class,避免在组件里重复定义颜色
3. **第三步**:如果用 Tailwind,配置 `tailwind.config.ts` 里 `theme.extend.colors` 把 zen 色板加入,这样可以写 `bg-zen-bg`、`text-zen-ink`、`border-zen-red` 等
4. **复用**:V8.5 calculator 里的所有组件样式(印章、四柱卡片、五行条、AI 内容块)可以直接复用,代码已经打磨过

---

## 参考来源

本规范提取自生产版本 Bazi Calculator V8.5 (Shopify),已在 bazi-master.com 上线验证。所有色值、字体、组件都经过市场验证,非 UI 设计师改动不要擅自调整。

