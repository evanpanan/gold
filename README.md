# 金岩石 GoldenRock · 香港持牌券商官网

> **磐石固本，金石创富**
> Steadfast as a Rock · Wealth Crafted with Integrity

扎根香港国际金融中心的专业金融服务机构品牌官网。纯静态零构建架构，内置 CMS 内容管理后台与三语切换（简中 / 繁体中文香港 / 英文）。

---

## ✨ 核心特性

- **5 页单页式官网**：首页（8 大板块 + Hero 动效）+ 三法律页（隐私政策 / 服务条款 / 免责声明）
- **CMS 后台（12 Tab）**：`admin.html` — 无需后端即可修改品牌 / 导航 / Hero / 关于 / 核心价值观 / 服务 / 合规资质 / CTA / 联系我们 / 表单 / 页脚 / 法律等 130+ 字段，写入 `localStorage` 即时生效
- **三语切换 i18n**：顶部导航金渐变胶囊切换 简 / 繁 / EN，`localStorage.GR_LANG` 持久化，支持 URL `?lang=zh_CN|zh_TW|en` 与 `navigator.language` 自动识别
- **全站 SVG 图标体系**：经典金融风格图标 + 统一圆角方容器；图标 / favicon / footer 联系图标 0 emoji 残留
- **Hero 首屏动效**：视差背景 / countUp 数字累计 / Intersection Reveal 渐入，首屏无白屏
- **深蓝 + 金品牌配色**：CSS 变量主题化（`--color-gold` / `--color-primary-dark`），可通过 CMS 一键微调
- **法律合规页三兄弟**：三法律页独立模板，支持 breadcrumb、锚点目录、返回顶按钮、三语全文翻译
- **无构建 / 无 CDN 依赖**：原生 HTML + CSS + JS，本地双击 `python3 -m http.server` 即可跑，部署 Vercel / GitHub Pages / 静态托管零配置

---

## 📁 项目结构

```
gold/
├── index.html              # 官网首页（8 大板块 + 三语切换 UI 挂载点）
├── privacy.html            # 法律页：隐私政策
├── terms.html              # 法律页：服务条款
├── disclaimer.html         # 法律页：免责声明
├── admin.html              # CMS 内容管理后台（12 Tab）
├── config.js               # 全站配置源（130+ 字段，CMS override 仅简中生效）
│
├── css/
│   ├── style.css           # 官网主样式（2080 行，品牌色 + 响应式）
│   └── legal.css           # 三法律页独立样式
│
├── js/
│   ├── i18n.js             # 三语字典 + window.I18N 单例（zh_CN / zh_TW / en 全量）
│   ├── main.js             # 首页主逻辑（loadConfig / renderDynamic / handleForm / countUp 等）
│   ├── legal.js            # 三法律页通用逻辑（目录/breadcrumb/返回顶/formatDate 三语）
│   └── admin.js            # CMS 后台逻辑（12 Tab 渲染 + localStorage override 读写）
│
├── start_server.py         # 本地启动脚本（端口 9090）
├── vercel.json             # Vercel SPA 重写规则（所有路由 fallback 到 index.html）
├── .gitignore
└── README.md
```

---

## 🚀 快速开始

### 方式一：一行命令（推荐，跨平台）

```bash
cd gold
python3 -m http.server 9090
```

打开浏览器访问：
- 官网首页：http://127.0.0.1:9090/index.html
- CMS 后台：http://127.0.0.1:9090/admin.html
- 三语言切换体验：
  - 简中：http://127.0.0.1:9090/index.html?lang=zh_CN
  - 繁中（香港）：http://127.0.0.1:9090/index.html?lang=zh_TW
  - 英文：http://127.0.0.1:9090/index.html?lang=en

### 方式二：本地常驻脚本（macOS）

```bash
python3 start_server.py
# Serving GoldenRock website at http://127.0.0.1:9090
```

---

## 🛠 CMS 后台使用说明

1. 打开 **http://127.0.0.1:9090/admin.html**
2. 使用 `config.js` 中 `admin.loginPassword` 字段登录（默认密码见配置）
3. 12 大 Tab 分别对应：
   - 品牌 / 导航 / Hero / 关于 / 价值观 / 服务 / 合规资质 / CTA / 联系我们 / 表单 / 页脚 / 法律
4. 每个字段点击保存后立即写入浏览器 `localStorage.GOLDENROCK_CONFIG_OVERRIDE`
5. 回到官网首页（zh_CN 语言下）即可看到修改生效

> ⚠️ **重要**：CMS override **仅在 简体中文 (zh_CN) 语言下合并生效**。切换到 繁中 / 英文 时，使用 `js/i18n.js` 内建的三语字典，不受 CMS 修改影响（避免出现简中修改后英文字段缺失）。

---

## 🌐 三语切换架构 (I18N)

### 方案选型约束
本项目是纯静态 + 无构建工具 + 无 CDN 依赖，因此：
- 不引入 `i18next`、不做按需加载字典（CDN/fetch 无法用）
- 采用 **单文件 `js/i18n.js` + `window.I18N` 全局单例**

### 语言识别优先级（4 级）
1. URL 参数 `?lang=zh_TW` / `#lang=en`
2. `localStorage.GR_LANG`（上次用户手动选择）
3. `navigator.language` 推断（`zh-HK|zh-TW|zh-MO → zh_TW`；`^zh.* → zh_CN`；其他 `→ en`）
4. 兜底 `zh_CN`

### 文案覆盖 4 层
| 层级 | 方式 | 样例 |
|------|------|------|
| L1 配置驱动 | `js/i18n.js → I18N.getConfig()` 替换 `config.js` 130+ 字段 | `hero.title` / `services[0].title` |
| L2 HTML 硬编码 | `data-i18n` / `data-i18n-html` / `data-i18n-attr` 属性标记 | `ui.nav.about` / `ui.form.privacyLabelHtml` |
| L3 JS 运行时 | `window.I18N.t('ui.form.requiredAll')` | 表单 alert / submit 按钮临时态文案 |
| L4 日期格式 | `toLocaleDateString` + locale 三语 | 中文「2026 年 10 月 1 日」 / 英文「Oct 1, 2026」 |

### 切换语言行为
点击导航胶囊 → 检查「联系我们」表单是否脏（有未提交内容）：
- ✅ 无脏数据 → 写 `GR_LANG` → 加 `?lang=` 参数 → `location.reload()`
- ⚠️ 有脏数据 → 弹原生 confirm：「切换语言将丢失已填写内容，确认继续？」→ 确认才切换

---

## 🧱 技术栈

| 类型 | 选型 | 说明 |
|------|------|------|
| 构建 | **零构建** | 无需 npm / webpack / vite |
| 前端 | 原生 HTML5 + CSS3 + ES2019 | 现代浏览器直接支持 |
| 状态存储 | `localStorage` | CMS override & 语言偏好 |
| 字体 | Google Fonts：**Noto Serif SC（中文衬线）+ Inter（英文无衬线）** | 中文衬线体现金融稳重感 |
| 图标 | 纯 inline SVG（经典金融风格）+ `currentColor` 继承文字色 | 0 emoji 残留，可主题化 |
| 动效 | 原生 `requestAnimationFrame` + IntersectionObserver | 首屏视差 / countUp / reveal |
| 托管 | 任意静态托管（Vercel 默认配置已内置） | |

---

## ☁️ 部署

### 方式一：Vercel（推荐，SPA 重写已配）
本项目已内置 `vercel.json`：

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

步骤：
```bash
npm i -g vercel  # 若本地无 vercel CLI
cd gold
vercel
```
或直接把 GitHub 仓库 `evanpanan/gold` 接入 Vercel dashboard，零配置发布。

### 方式二：GitHub Pages
1. GitHub 仓库 Settings → Pages → Source = `Deploy from a branch`
2. Branch = `main` / `root` → Save
3. 几分钟后访问 `https://evanpanan.github.io/gold/`
4. 若托管在子路径 `/gold/` 下，需要把资源 `src="js/..."` 改为 `src="/gold/js/..."` 或用相对路径（当前默认为根路径部署）

### 方式三：任意静态托管（Nginx / Cloudflare Pages / Netlify）
直接把根目录所有文件上传即可。需要注意 SPA 锚点 `#about`、`#services` 需要 fallback 到 `index.html`。

---

## ⚖️ 法律与合规声明

> 本网站（GoldenRock / 金岩石）所载资料及内容 **仅供参考**，并不构成任何证券、金融产品或工具的要约、邀约、招揽、建议、意见或任何保证。
>
> 投资涉及风险，证券价格可升可跌，甚至变成毫无价值。过往业绩并不代表将来表现。投资者在作出任何投资决定前，应考虑本身的财政状况、投资目标及经验、风险承受能力及仔细了解相关产品或服务的性质及风险。如有疑问，请咨询独立专业顾问。

金岩石有限公司 Golden Rock Limited 为**香港注册成立之公司，并受香港证券及期货事务监察委员会（SFC）监管**。网站内引用的 SFC /《证券及期货条例》/ 客户资产隔离托管等合规措辞遵循香港本地监管语境，英文措辞对应 Client Asset Segregation / SFO / SFC / PCPD / HKIAC。

---

© 2026 金岩石有限公司 GOLDEN ROCK LIMITED · 版权所有 All Rights Reserved.
