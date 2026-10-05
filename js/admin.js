(function () {
    'use strict';

    const DEFAULT_CFG = window.GOLDENROCK_CONFIG || {};
    const OVERRIDE_KEY = 'GOLDENROCK_CONFIG_OVERRIDE';
    const AUTH_KEY = 'GOLDENROCK_ADMIN_AUTH';

    let currentCfg = loadConfig();
    let dirty = false;
    let activeTab = 'site';
    let renderedSchemaFields = [];

    const NAV_ITEMS = [
        { id: 'site',        label: '站点设置',   icon: siteIcon(),   desc: '网站标题、关键词、品牌名称、LOGO SVG、登录密码等基础信息' },
        { id: 'hero',        label: '首页首屏',   icon: heroIcon(),   desc: '主标题、副标题、CTA 按钮、数据统计卡片' },
        { id: 'about',       label: '关于我们',   icon: aboutIcon(),  desc: '公司简介、企业愿景、使命、信息展示卡片' },
        { id: 'values',      label: '核心价值观', icon: valuesIcon(), desc: '四项核心价值观：标题 + 描述，可增删排序' },
        { id: 'services',    label: '核心服务',   icon: servicesIcon(), desc: '证券交易、投资咨询、跨境配置三大服务，特性列表可编辑' },
        { id: 'compliance',  label: '合规资质',   icon: shieldIcon(), desc: 'SFC 监管主卡 + 四项安全保障特性' },
        { id: 'cta',         label: '行动召唤',   icon: ctaIcon(),    desc: '金色 CTA 大卡片的标题、描述、双按钮' },
        { id: 'contact',     label: '联系我们',   icon: contactIcon(),desc: '联系方式卡片、表单文案、下拉服务选项' },
        { id: 'footer',      label: '页脚信息',   icon: footerIcon(), desc: '免责声明、版权、法律链接、品牌简介' },
        { id: 'legalPrivacy',    label: '隐私政策',   icon: legalPrivacyIcon(),    desc: '公司如何收集使用共享存储用户信息；Cookie、主体权利、更新与联系方式等完整条款' },
        { id: 'legalTerms',      label: '服务条款',   icon: legalTermsIcon(),      desc: '开户资格、账户安全、风险披露、费用税费、行为准则、争议解决等条款' },
        { id: 'legalDisclaimer', label: '免责声明',   icon: legalDisclaimerIcon(), desc: '信息准确性不保证、投资风险特别提示、责任限制、非香港用户注意事项' }
    ];

    const FIELD_SCHEMAS = buildFieldSchemas();

    function siteIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="8"/><path d="M2 10h16M10 2a15.3 15.3 0 010 16M10 2a15.3 15.3 0 000 16"/></svg>'; }
    function heroIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 15l4-6 4 3 3-4 3 5H3z"/><path d="M3 17h14"/></svg>'; }
    function aboutIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="7" r="3"/><path d="M3 17c1.5-3.5 4.5-5 7-5s5.5 1.5 7 5"/></svg>'; }
    function valuesIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 2l2.8 5.7 6.2.9-4.5 4.4 1 6.2L10 16l-5.5 3.2 1-6.2L1 8.6l6.2-.9z"/></svg>'; }
    function servicesIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="10" y="3" width="7" height="7" rx="1"/><rect x="3" y="10" width="7" height="7" rx="1"/><rect x="10" y="10" width="7" height="7" rx="1"/></svg>'; }
    function shieldIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 2l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z"/><path d="M7 10l2 2 4-4"/></svg>'; }
    function ctaIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/></svg>'; }
    function contactIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="14" height="12" rx="2"/><path d="M3 7l7 5 7-5"/></svg>'; }
    function footerIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 15h16M2 12h16M5 17h10"/><path d="M10 2l6 4v4H4V6z"/></svg>'; }
    function legalPrivacyIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="12" height="8" rx="2"/><path d="M7 10V7a3 3 0 016 0v3"/><circle cx="10" cy="14" r="1.2"/><path d="M10 15.2V16.5"/></svg>'; }
    function legalTermsIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3h9l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v4h4"/><path d="M7.5 10h7M7.5 13h5M7.5 16h6"/><path d="M7 7.5l1 1 2.5-2.5"/></svg>'; }
    function legalDisclaimerIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 2l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z"/><path d="M10 7v4.5"/><circle cx="10" cy="13.5" r="1" fill="currentColor"/></svg>'; }

    function buildFieldSchemas() {
        return {
            site: [
                { sec: '网站元信息', desc: '影响浏览器标签、搜索引擎索引' },
                { key: 'site.title',              label: '浏览器标题', type: 'text', hint: 'Title 标签，显示在浏览器标签页' },
                { key: 'site.metaDescription',    label: 'SEO 描述',  type: 'textarea',  hint: 'Meta Description 搜索结果摘要' },
                { key: 'site.metaKeywords',       label: 'SEO 关键词', type: 'text', hint: '逗号分隔英文/中文关键词' },
                { sec: '品牌名称', desc: '导航栏、页脚的品牌标识文字' },
                { key: 'brand.logoCn',            label: '中文品牌名', type: 'text' },
                { key: 'brand.logoEn',            label: '英文品牌名(短)', type: 'text', hint: '导航栏内使用，如 GOLDEN ROCK' },
                { key: 'brand.logoEnFull',        label: '英文品牌名(全)', type: 'text', hint: '页脚使用，如 GOLDEN ROCK LIMITED' },
                { key: 'brand.heroBadge',         label: '首屏徽章文字', type: 'text' },
                { key: 'brand.taglinePrimary',    label: '首屏主标语',   type: 'text' },
                { key: 'brand.taglineSecondary',  label: '首屏金色标语', type: 'text' },
                { sec: '品牌 LOGO (SVG)', desc: '粘贴 SVG 代码即可更新，替换默认石形图标。留空使用默认图标' },
                { key: 'brand.logoSvg',   label: 'LOGO SVG 代码', type: 'code', hint: '完整 <svg>...</svg> 标签，viewBox 建议 0 0 40 40' },
                { sec: '后台安全', desc: '登录密码与权限' },
                { key: 'admin.loginPassword', label: '管理员登录密码', type: 'text', hint: '请使用复杂密码，避免默认 admin123' }
            ],
            hero: [
                { sec: '文案与按钮', desc: '首屏中央核心区域' },
                { key: 'hero.subtitle',        label: '副标题文案', type: 'textarea', hint: '支持 \\n 或回车换行；将转换为换行显示' },
                { sec: '主按钮', desc: '左侧高亮金色按钮' },
                { key: 'hero.ctaPrimary.text', label: '主按钮 · 文字', type: 'text' },
                { key: 'hero.ctaPrimary.href', label: '主按钮 · 链接', type: 'text', hint: '#anchor 或 URL' },
                { sec: '次按钮', desc: '右侧边框按钮' },
                { key: 'hero.ctaSecondary.text', label: '次按钮 · 文字', type: 'text' },
                { key: 'hero.ctaSecondary.href', label: '次按钮 · 链接', type: 'text' },
                { sec: '数据统计卡片', desc: '首屏底部 3 个数字卡片，可增删' },
                { key: 'hero.stats',    label: '统计卡片列表',  type: 'list',
                  itemSchema: [
                      { key: 'value', label: '数值/文字', type: 'text' },
                      { key: 'label', label: '下方说明',  type: 'text' }
                  ]
                }
            ],
            about: [
                { sec: '公司简介', desc: '左栏顶部两段介绍文字，支持 HTML 标签（如 <span class="text-gold font-bold">高亮</span>）' },
                { key: 'about.intro', label: '简介段落', type: 'list',
                  itemSchema: [
                      { key: '__str__', label: '段落内容', type: 'textarea', hint: '可使用简单 HTML 标签' }
                  ]
                },
                { sec: '企业愿景', desc: '' },
                { key: 'about.vision.title', label: '愿景标题', type: 'text' },
                { key: 'about.vision.desc',  label: '愿景描述', type: 'textarea' },
                { sec: '企业使命', desc: '' },
                { key: 'about.mission.title', label: '使命标题', type: 'text' },
                { key: 'about.mission.desc',  label: '使命描述', type: 'textarea' },
                { sec: '右侧深色信息卡', desc: '视觉化展示的 3 张要点卡片' },
                { key: 'about.visualCards', label: '信息卡片', type: 'list',
                  itemSchema: [
                      { key: 'icon',  label: '图标语义', type: 'select', options: [
                          { value: 'hq',      label: '总部 / 总部大楼（hq）' },
                          { value: 'mkts',    label: '市场 / K 线柱图（mkts）' },
                          { value: 'clients', label: '客户 / 账户（clients）' }
                      ], hint: '选择对应语义，自动渲染 SVG 小图标' },
                      { key: 'value', label: '主文字',            type: 'text' },
                      { key: 'label', label: '说明文字',           type: 'text' }
                  ]
                }
            ],
            values: [
                { sec: '核心价值观项目', desc: '建议 4 项，可增删、拖拽排序' },
                { key: 'values', label: '价值观列表', type: 'list',
                  itemSchema: [
                      { key: 'num',   label: '编号（01/02…）', type: 'text' },
                      { key: 'title', label: '标题（4 字）',   type: 'text' },
                      { key: 'desc',  label: '描述文本',       type: 'textarea' }
                  ]
                }
            ],
            services: [
                { sec: '服务项目', desc: '建议 3 项，中间项可设置为高亮核心服务' },
                { key: 'services', label: '服务列表', type: 'list',
                  itemSchema: [
                      { key: 'num',          label: '编号',           type: 'text' },
                      { key: 'title',        label: '服务名称',        type: 'text' },
                      { key: 'desc',         label: '服务描述（支持HTML）', type: 'textarea' },
                      { key: 'featured',     label: '设为高亮核心服务', type: 'checkbox' },
                      { key: 'featuredLabel',label: '高亮卡片顶部徽章文字', type: 'text', hint: '仅在勾选"高亮"时显示' },
                      { key: 'features',     label: '特性列表',        type: 'list',
                        itemSchema: [
                            { key: '__str__', label: '特性名称', type: 'text' }
                        ]
                      }
                  ]
                }
            ],
            compliance: [
                { sec: '合规主卡', desc: '左侧深蓝大卡片' },
                { key: 'compliance.hero.badge', label: '左上角徽章文字', type: 'text' },
                { key: 'compliance.hero.title', label: '主标题',         type: 'text' },
                { key: 'compliance.hero.desc',  label: '详细说明（支持HTML）', type: 'textarea' },
                { key: 'compliance.hero.note',  label: '底部提示文字',   type: 'text' },
                { sec: '安全特性卡片', desc: '右侧 2x2 四张特性卡片，可增删' },
                { key: 'compliance.features', label: '特性列表', type: 'list',
                  itemSchema: [
                      { key: 'title', label: '特性标题', type: 'text' },
                      { key: 'desc',  label: '特性描述', type: 'textarea' }
                  ]
                }
            ],
            cta: [
                { sec: '金色 CTA 大卡片', desc: '合规与联系之间的大卡片召唤区' },
                { key: 'cta.title',           label: '主标题',  type: 'text' },
                { key: 'cta.desc',            label: '描述（\\n 换行）', type: 'textarea' },
                { key: 'cta.ctaPrimary.text', label: '主按钮文字', type: 'text' },
                { key: 'cta.ctaPrimary.href', label: '主按钮链接', type: 'text' },
                { key: 'cta.ctaSecondary.text', label: '次按钮文字', type: 'text' },
                { key: 'cta.ctaSecondary.href', label: '次按钮链接', type: 'text' }
            ],
            contact: [
                { sec: '联系信息卡片', desc: '左侧 4 张联系方式卡片，可增删（内置图标不随配置更改）' },
                { key: 'contact.items', label: '联系方式列表', type: 'list',
                  itemSchema: [
                      { key: 'icon',  label: '图标类型(暂未渲染，保留)', type: 'text', hint: 'location/phone/email/time，当前使用内置SVG' },
                      { key: 'label', label: '标签（如 公司地址）',       type: 'text' },
                      { key: 'value', label: '值（如 香港中环…）',        type: 'text' }
                  ]
                },
                { sec: '咨询表单', desc: '右侧表单文案（表单结构固定）' },
                { key: 'contact.form.title',      label: '表单标题',     type: 'text' },
                { key: 'contact.form.desc',       label: '表单说明文字', type: 'textarea' },
                { key: 'contact.form.submitText', label: '提交按钮文字', type: 'text' },
                { sec: '服务下拉选项', desc: '"咨询服务"下拉框的可选项' },
                { key: 'contact.serviceOptions', label: '下拉选项列表', type: 'list',
                  itemSchema: [
                      { key: 'value', label: '选项 value (英文/编号)', type: 'text' },
                      { key: 'label', label: '选项显示文字',            type: 'text' }
                  ]
                }
            ],
            footer: [
                { sec: '页脚品牌区', desc: '页脚顶部左侧' },
                { key: 'footer.brandDesc', label: '品牌简介', type: 'textarea' },
                { sec: '免责声明', desc: '页脚中部大块合规声明（请谨慎编辑，SFC监管要求）' },
                { key: 'footer.disclaimerTitle', label: '标题文字（加粗）', type: 'text' },
                { key: 'footer.disclaimer',      label: '第一段正文',       type: 'textarea' },
                { key: 'footer.regulatorNote',   label: '第二段 · 监管说明', type: 'textarea' },
                { sec: '版权 & 底部链接', desc: '' },
                { key: 'footer.copyright', label: '版权文字', type: 'text' },
                { key: 'footer.links',     label: '底部法律链接', type: 'list',
                  itemSchema: [
                      { key: 'text', label: '显示文字', type: 'text' },
                      { key: 'href', label: '跳转链接/锚点', type: 'text' }
                  ]
                }
            ],
            legalPrivacy: [
                { sec: '页面信息', desc: '页面标题、SEO 元信息、发布信息' },
                { key: 'legal.privacy.pageTitle',       label: '页面标题中文', type: 'text' },
                { key: 'legal.privacy.pageTitleEn',    label: '英文副标题', type: 'text' },
                { key: 'legal.privacy.metaDescription', label: 'SEO描述', type: 'textarea' },
                { key: 'legal.privacy.companyName',    label: '发布公司名', type: 'text' },
                { key: 'legal.privacy.effectiveDate',  label: '生效日期 YYYY-MM-DD', type: 'text' },
                { key: 'legal.privacy.lastUpdated',    label: '最后更新 YYYY-MM-DD', type: 'text' },
                { sec: '总则/导言', desc: '' },
                { key: 'legal.privacy.intro', label: '前言/导言文本', type: 'textarea' },
                { sec: '章节列表', desc: '8条章节列表可编辑，可增删排序' },
                { key: 'legal.privacy.sections', label: '章节列表', type: 'list',
                  itemSchema: [
                      { key: 'title', label: '章节标题（如"一、我们如何收集..."）', type: 'text' },
                      { key: 'paragraphs', label: '段落内容', type: 'list',
                        itemSchema: [
                            { key: '__str__', label: '段落内容', type: 'textarea' }
                        ]
                      }
                  ]
                }
            ],
            legalTerms: [
                { sec: '页面信息', desc: '页面标题、SEO 元信息、发布信息' },
                { key: 'legal.terms.pageTitle',       label: '页面标题中文', type: 'text' },
                { key: 'legal.terms.pageTitleEn',    label: '英文副标题', type: 'text' },
                { key: 'legal.terms.metaDescription', label: 'SEO描述', type: 'textarea' },
                { key: 'legal.terms.companyName',    label: '发布公司名', type: 'text' },
                { key: 'legal.terms.effectiveDate',  label: '生效日期 YYYY-MM-DD', type: 'text' },
                { key: 'legal.terms.lastUpdated',    label: '最后更新 YYYY-MM-DD', type: 'text' },
                { sec: '总则/导言', desc: '' },
                { key: 'legal.terms.intro', label: '前言/导言文本', type: 'textarea' },
                { sec: '章节列表', desc: '9条章节列表可编辑，可增删排序' },
                { key: 'legal.terms.sections', label: '章节列表', type: 'list',
                  itemSchema: [
                      { key: 'title', label: '章节标题（如"一、我们如何收集..."）', type: 'text' },
                      { key: 'paragraphs', label: '段落内容', type: 'list',
                        itemSchema: [
                            { key: '__str__', label: '段落内容', type: 'textarea' }
                        ]
                      }
                  ]
                }
            ],
            legalDisclaimer: [
                { sec: '页面信息', desc: '页面标题、SEO 元信息、发布信息' },
                { key: 'legal.disclaimer.pageTitle',       label: '页面标题中文', type: 'text' },
                { key: 'legal.disclaimer.pageTitleEn',    label: '英文副标题', type: 'text' },
                { key: 'legal.disclaimer.metaDescription', label: 'SEO描述', type: 'textarea' },
                { key: 'legal.disclaimer.companyName',    label: '发布公司名', type: 'text' },
                { key: 'legal.disclaimer.effectiveDate',  label: '生效日期 YYYY-MM-DD', type: 'text' },
                { key: 'legal.disclaimer.lastUpdated',    label: '最后更新 YYYY-MM-DD', type: 'text' },
                { sec: '总则/导言', desc: '' },
                { key: 'legal.disclaimer.intro', label: '前言/导言文本', type: 'textarea' },
                { sec: '章节列表', desc: '10条章节列表可编辑，可增删排序' },
                { key: 'legal.disclaimer.sections', label: '章节列表', type: 'list',
                  itemSchema: [
                      { key: 'title', label: '章节标题（如"一、我们如何收集..."）', type: 'text' },
                      { key: 'paragraphs', label: '段落内容', type: 'list',
                        itemSchema: [
                            { key: '__str__', label: '段落内容', type: 'textarea' }
                        ]
                      }
                  ]
                }
            ]
        };
    }

    function loadConfig() {
        const base = cloneJSON(DEFAULT_CFG);
        try {
            const s = localStorage.getItem(OVERRIDE_KEY);
            if (s) return deepMerge(base, JSON.parse(s));
        } catch (e) { console.warn(e); }
        return base;
    }
    function saveConfig(cfg) {
        const override = computeOverride(DEFAULT_CFG, cfg);
        localStorage.setItem(OVERRIDE_KEY, JSON.stringify(override));
    }
    function computeOverride(base, cur) {
        const out = {};
        let has = false;
        Object.keys(cur).forEach(function (k) {
            const b = base ? base[k] : undefined;
            const c = cur[k];
            if (c && typeof c === 'object' && !Array.isArray(c) && b && typeof b === 'object' && !Array.isArray(b)) {
                const sub = computeOverride(b, c);
                if (Object.keys(sub).length) { out[k] = sub; has = true; }
            } else if (JSON.stringify(b) !== JSON.stringify(c)) {
                out[k] = cloneJSON(c);
                has = true;
            }
        });
        return has ? out : {};
    }
    function cloneJSON(o) { return JSON.parse(JSON.stringify(o)); }
    function deepMerge(t, s) {
        if (!s || typeof s !== 'object') return t;
        const o = Array.isArray(t) ? t.slice() : Object.assign({}, t);
        Object.keys(s).forEach(function (k) {
            const sv = s[k], tv = o[k];
            if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
                o[k] = deepMerge(tv, sv);
            } else o[k] = cloneJSON(sv);
        });
        return o;
    }
    function resolvePath(obj, p) {
        return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, obj);
    }
    function setPath(obj, p, v) {
        const keys = p.split('.');
        let cur = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!cur[k] || typeof cur[k] !== 'object') cur[k] = isNaN(parseInt(keys[i + 1])) ? {} : [];
            cur = cur[k];
        }
        cur[keys[keys.length - 1]] = v;
    }

    /* ============ AUTH ============ */
    function checkAuth() {
        try {
            const s = sessionStorage.getItem(AUTH_KEY);
            if (!s) return false;
            const { exp, sig } = JSON.parse(s);
            if (Date.now() > exp) return false;
            const expect = signAuth();
            return sig === expect;
        } catch (e) { return false; }
    }
    function signAuth() {
        let h = 0;
        const s = (resolvePath(DEFAULT_CFG, 'admin.loginPassword') || 'admin123') + '|gr_salt_v1|' + Math.floor(Date.now() / 7200000);
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        return String(h);
    }
    function setAuth() {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ exp: Date.now() + 7200 * 1000, sig: signAuth() }));
    }
    function clearAuth() { sessionStorage.removeItem(AUTH_KEY); }

    /* ============ INIT ============ */
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        if (!checkAuth()) {
            document.getElementById('loginView').style.display = 'flex';
            document.getElementById('adminView').style.display = 'none';
            bindLogin();
        } else {
            enterAdmin();
        }
    }

    function bindLogin() {
        const form = document.getElementById('loginForm');
        const pwd = document.getElementById('loginPwd');
        const err = document.getElementById('loginError');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const expect = resolvePath(DEFAULT_CFG, 'admin.loginPassword') || resolvePath(currentCfg, 'admin.loginPassword') || 'admin123';
            if (pwd.value === expect) {
                setAuth();
                toast('success', '登录成功', '正在进入内容管理后台…');
                setTimeout(enterAdmin, 350);
            } else {
                err.style.display = 'block';
                pwd.classList.add('shake');
                setTimeout(function () { pwd.classList.remove('shake'); }, 300);
            }
        });
    }

    function enterAdmin() {
        document.getElementById('loginView').style.display = 'none';
        document.getElementById('adminView').style.display = 'flex';
        renderNav();
        switchTab(activeTab);
        bindTopButtons();
        bindModalClose();
        updateSaveStatus();
    }

    function renderNav() {
        const ul = document.getElementById('adminNav');
        ul.innerHTML = NAV_ITEMS.map(function (n) {
            return '<li data-tab="' + n.id + '" class="' + (n.id === activeTab ? 'active' : '') + '"><a>' +
                   '<span class="nav-icon">' + n.icon + '</span><span>' + n.label + '</span></a></li>';
        }).join('');
        ul.querySelectorAll('li').forEach(function (li) {
            li.addEventListener('click', function () { switchTab(li.getAttribute('data-tab')); });
        });
    }

    function switchTab(id) {
        activeTab = id;
        document.querySelectorAll('#adminNav li').forEach(function (li) {
            li.classList.toggle('active', li.getAttribute('data-tab') === id);
        });
        const item = NAV_ITEMS.find(function (n) { return n.id === id; });
        document.getElementById('pageTitle').textContent = item ? item.label : '';
        document.getElementById('pageDesc').textContent = item ? item.desc : '';
        renderForm(id);
        closeSidebar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openSidebar() {
        try {
            const sb = document.querySelector('.admin-sidebar');
            const mk = document.getElementById('sidebarMask');
            const tg = document.getElementById('sidebarToggle');
            if (sb) sb.classList.add('open');
            if (mk) mk.classList.add('open');
            if (tg) tg.setAttribute('aria-expanded', 'true');
        } catch (e) {}
    }
    function closeSidebar() {
        try {
            const sb = document.querySelector('.admin-sidebar');
            const mk = document.getElementById('sidebarMask');
            const tg = document.getElementById('sidebarToggle');
            if (sb) sb.classList.remove('open');
            if (mk) mk.classList.remove('open');
            if (tg) tg.setAttribute('aria-expanded', 'false');
        } catch (e) {}
    }
    function toggleSidebar() {
        try {
            const sb = document.querySelector('.admin-sidebar');
            if (sb && sb.classList.contains('open')) closeSidebar();
            else openSidebar();
        } catch (e) {}
    }

    /* ============ FORM RENDER ============ */
    function renderForm(tabId) {
        const container = document.getElementById('formContainer');
        const schema = FIELD_SCHEMAS[tabId] || [];
        renderedSchemaFields = [];
        const frag = document.createDocumentFragment();
        let html = '';
        let currentSection = null;

        function pushSection() {
            if (currentSection) {
                html += '</div>';
                currentSection = null;
            }
        }

        schema.forEach(function (f) {
            if (f.sec) {
                pushSection();
                html += '<div class="form-section"><h3 class="form-section-title">' + esc(f.sec) + '</h3>';
                if (f.desc) html += '<p class="form-section-desc">' + esc(f.desc) + '</p>';
                currentSection = true;
                html += '<div class="form-grid ' + (f.grid || '') + '">';
                return;
            }
            html += renderField(f);
        });
        pushSection();
        if (html) {
            const wrap = document.createElement('div');
            wrap.innerHTML = html;
            container.innerHTML = '';
            container.appendChild(wrap);
        }
        bindFormInputs();
    }

    function renderField(f) {
        const id = 'f_' + f.key.replace(/\./g, '__');
        const val = resolvePath(currentCfg, f.key);
        const colCls = f.full ? 'full' : '';
        const labelTip = f.hint ? '<span class="hint-icon" data-tip="' + escAttr(f.hint) + '">?</span>' : '';
        let inputHtml = '';

        if (f.type === 'text' || f.type === 'email' || f.type === 'tel' || f.type === 'url' || f.type === 'password') {
            inputHtml = '<input type="' + f.type + '" id="' + id + '" data-key="' + f.key + '" value="' + escAttr(val == null ? '' : val) + '">';
        } else if (f.type === 'textarea') {
            inputHtml = '<textarea id="' + id + '" data-key="' + f.key + '" rows="3">' + esc(val == null ? '' : val) + '</textarea>';
        } else if (f.type === 'code') {
            inputHtml = '<textarea id="' + id + '" data-key="' + f.key + '" spellcheck="false" class="code-area" rows="10">' + esc(val == null ? '' : val) + '</textarea>';
        } else if (f.type === 'checkbox') {
            inputHtml = '<label class="form-check-inline">' +
                '<input type="checkbox" id="' + id + '" data-key="' + f.key + '" ' + (val ? 'checked' : '') + '>' +
                '<span>启用（勾选即生效）</span></label>';
        } else if (f.type === 'select') {
            const opts = Array.isArray(f.options) ? f.options : [];
            let selHtml = '<select id="' + id + '" data-key="' + f.key + '">';
            opts.forEach(function (op) {
                const ov = typeof op === 'string' ? op : (op.value || '');
                const ol = typeof op === 'string' ? op : (op.label || ov);
                const match = String(val == null ? '' : val) === String(ov);
                selHtml += '<option value="' + escAttr(ov) + '"' + (match ? ' selected' : '') + '>' + esc(ol) + '</option>';
            });
            selHtml += '</select>';
            inputHtml = selHtml;
        } else if (f.type === 'list') {
            inputHtml = renderListEditor(f, id, val || []);
        } else {
            inputHtml = '<input id="' + id + '" data-key="' + f.key + '" value="' + escAttr(val == null ? '' : val) + '">';
        }

        if (f.type === 'checkbox') {
            return '<div class="form-group ' + colCls + '"><label>' + esc(f.label) + labelTip + '</label>' + inputHtml + '</div>';
        }
        return '<div class="form-group ' + colCls + '"><label for="' + id + '">' + esc(f.label) + labelTip + '</label>' + inputHtml + '</div>';
    }

    function renderListEditor(f, id, list) {
        const itemSchema = f.itemSchema || [];
        let out = '<div class="list-editor" data-listkey="' + f.key + '" id="' + id + '">';
        list.forEach(function (item, idx) {
            out += renderListItemCard(f.key, itemSchema, item, idx);
        });
        out += '</div>';
        out += '<button type="button" class="add-item-btn" data-addlist="' + f.key + '">' +
               '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4v12M4 10h12"/></svg>添加一项</button>';
        return out;
    }

    function renderListItemCard(parentKey, itemSchema, item, idx) {
        let out = '<div class="list-item-card" data-idx="' + idx + '">';
        out += '<div class="item-header">' +
               '<span class="item-index"><span class="idx-num">' + String(idx + 1).padStart(2, '0') + '</span>第 ' + (idx + 1) + ' 项</span>' +
               '<span class="item-actions">' +
               '<button class="btn-move" title="拖动排序" draggable="true"><svg viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg></button>' +
               '<button class="btn-del" title="删除" data-dellist="' + parentKey + '" data-idx="' + idx + '"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h10M6 4V3h4v1M4 4l1 9h6l1-9"/></svg></button>' +
               '</span></div>';
        out += '<div class="form-grid cols-1">';
        itemSchema.forEach(function (sf) {
            const val = sf.key === '__str__' ? item : item[sf.key];
            const fid = 'li_' + parentKey.replace(/\./g, '__') + '_' + idx + '_' + (sf.key || '__str');
            let inputHtml = '';
            if (sf.type === 'textarea') {
                inputHtml = '<textarea id="' + fid + '" data-itemkey="' + parentKey + '" data-itemidx="' + idx + '" data-field="' + sf.key + '" rows="3">' + esc(val == null ? '' : val) + '</textarea>';
            } else if (sf.type === 'checkbox') {
                inputHtml = '<label class="form-check-inline">' +
                    '<input type="checkbox" id="' + fid + '" data-itemkey="' + parentKey + '" data-itemidx="' + idx + '" data-field="' + sf.key + '" ' + (val ? 'checked' : '') + '>' +
                    '<span>启用</span></label>';
            } else if (sf.type === 'list') {
                inputHtml = '<div class="list-editor" data-listkey="' + parentKey + '.' + idx + '.' + sf.key + '" id="' + fid + '">';
                const subList = (val && Array.isArray(val)) ? val : [];
                subList.forEach(function (subItem, si) {
                    inputHtml += renderListItemCard(parentKey + '.' + idx + '.' + sf.key, sf.itemSchema, subItem, si);
                });
                inputHtml += '</div>';
                inputHtml += '<button type="button" class="add-item-btn" data-addlist="' + parentKey + '.' + idx + '.' + sf.key + '"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4v12M4 10h12"/></svg>新增子项</button>';
            } else {
                inputHtml = '<input type="' + (sf.type || 'text') + '" id="' + fid + '" data-itemkey="' + parentKey + '" data-itemidx="' + idx + '" data-field="' + sf.key + '" value="' + escAttr(val == null ? '' : val) + '">';
            }
            if (sf.type === 'checkbox') {
                out += '<div class="form-group full"><label>' + esc(sf.label) + '</label>' + inputHtml + '</div>';
            } else {
                out += '<div class="form-group full"><label for="' + fid + '">' + esc(sf.label) + (sf.hint ? ' <span class="hint-icon" data-tip="' + escAttr(sf.hint) + '">?</span>' : '') + '</label>' + inputHtml + '</div>';
            }
        });
        out += '</div></div>';
        return out;
    }

    function bindFormInputs() {
        const c = document.getElementById('formContainer');

        c.querySelectorAll('input,textarea,select').forEach(function (el) {
            if (el.closest('[data-listkey] .list-item-card') && el.hasAttribute('data-itemkey')) return;
            if (!el.hasAttribute('data-key')) return;
            el.addEventListener('input', function () {
                const key = el.getAttribute('data-key');
                let v;
                if (el.type === 'checkbox') v = el.checked;
                else v = el.value;
                setPath(currentCfg, key, v);
                markDirty();
            });
            if (el.type === 'checkbox') {
                el.addEventListener('change', function () {
                    const key = el.getAttribute('data-key');
                    setPath(currentCfg, key, el.checked);
                    markDirty();
                });
            }
        });

        c.querySelectorAll('[data-itemkey]').forEach(function (el) {
            el.addEventListener('input', function () {
                updateListItemValue(el);
                markDirty();
            });
            if (el.type === 'checkbox') {
                el.addEventListener('change', function () {
                    updateListItemValue(el);
                    markDirty();
                });
            }
        });

        c.querySelectorAll('[data-addlist]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const listKey = btn.getAttribute('data-addlist');
                const schema = findListSchema(listKey);
                const arr = resolvePath(currentCfg, listKey);
                if (!Array.isArray(arr)) { setPath(currentCfg, listKey, []); }
                const newItem = createDefaultItem(schema && schema.itemSchema);
                resolvePath(currentCfg, listKey).push(newItem);
                markDirty();
                rerenderCurrentTab();
                toast('success', '已新增', '已添加一项，可在下方继续编辑');
            });
        });

        c.querySelectorAll('[data-dellist]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const listKey = btn.getAttribute('data-dellist');
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const arr = resolvePath(currentCfg, listKey);
                if (!arr || !arr.length) return;
                if (!confirm('确认删除第 ' + (idx + 1) + ' 项？')) return;
                arr.splice(idx, 1);
                markDirty();
                rerenderCurrentTab();
                toast('warning', '已删除', '该项已从列表移除');
            });
        });

        bindDragSort(c);
    }

    function updateListItemValue(el) {
        const listKey = el.getAttribute('data-itemkey');
        const idx = parseInt(el.getAttribute('data-itemidx'), 10);
        const field = el.getAttribute('data-field');
        const list = resolvePath(currentCfg, listKey);
        if (!list || !list[idx]) return;
        let v;
        if (el.type === 'checkbox') v = el.checked;
        else v = el.value;
        if (field === '__str__' || !field) list[idx] = v;
        else list[idx][field] = v;
    }

    function findListSchema(listKey, baseTab) {
        const tab = baseTab || activeTab;
        const schema = FIELD_SCHEMAS[tab] || [];
        for (let i = 0; i < schema.length; i++) {
            const f = schema[i];
            if (!f.sec && f.type === 'list' && f.key === listKey) return f;
            if (!f.sec && f.type === 'list' && listKey.indexOf(f.key + '.') === 0) {
                const rest = listKey.slice(f.key.length + 1);
                const keys = rest.split('.');
                let curItemSchema = f.itemSchema;
                for (let k = 0; k < keys.length; k += 3) {
                    const idxKey = keys[k + 0];
                    const fieldKey = keys[k + 1];
                    if (!curItemSchema) break;
                    const sub = curItemSchema.find(function (s) { return s.key === fieldKey && s.type === 'list'; });
                    if (sub) curItemSchema = sub.itemSchema;
                }
                return { itemSchema: curItemSchema || [] };
            }
        }
        return null;
    }

    function createDefaultItem(itemSchema) {
        if (!itemSchema) return {};
        if (itemSchema.length === 1 && itemSchema[0].key === '__str__') return '';
        const out = {};
        itemSchema.forEach(function (sf) {
            if (sf.key === '__str__') return;
            if (sf.type === 'checkbox') out[sf.key] = false;
            else if (sf.type === 'list') out[sf.key] = [];
            else out[sf.key] = '';
        });
        return out;
    }

    function rerenderCurrentTab() {
        renderForm(activeTab);
    }

    function bindDragSort(c) {
        const containers = c.querySelectorAll('[data-listkey]');
        containers.forEach(function (ct) {
            let dragged = null;
            ct.querySelectorAll('.list-item-card > .item-header .btn-move').forEach(function (handle) {
                handle.addEventListener('dragstart', function (e) {
                    dragged = handle.closest('.list-item-card');
                    dragged.classList.add('dragging');
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
                });
                handle.addEventListener('dragend', function () {
                    if (dragged) dragged.classList.remove('dragging');
                    dragged = null;
                    reorderByDOM(ct);
                });
            });
            ct.addEventListener('dragover', function (e) {
                e.preventDefault();
                if (!dragged) return;
                const after = getDragAfterEl(ct, e.clientY);
                if (after == null) ct.appendChild(dragged);
                else ct.insertBefore(dragged, after);
            });
        });

        function getDragAfterEl(ct, y) {
            const els = Array.from(ct.querySelectorAll('.list-item-card:not(.dragging)'));
            return els.reduce(function (closest, child) {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
                else return closest;
            }, { offset: -Infinity }).element;
        }
        function reorderByDOM(ct) {
            const listKey = ct.getAttribute('data-listkey');
            const cur = resolvePath(currentCfg, listKey);
            if (!Array.isArray(cur)) return;
            const domItems = ct.querySelectorAll(':scope > .list-item-card');
            const nextArr = [];
            domItems.forEach(function (d) {
                const i = parseInt(d.getAttribute('data-idx'), 10);
                if (cur[i] !== undefined) nextArr.push(cur[i]);
            });
            if (nextArr.length === cur.length) {
                setPath(currentCfg, listKey, nextArr);
                markDirty();
                rerenderCurrentTab();
            }
        }
    }

    /* ============ TOP BUTTONS ============ */
    function bindTopButtons() {
        const toggle = document.getElementById('sidebarToggle');
        const mask = document.getElementById('sidebarMask');
        if (toggle) toggle.addEventListener('click', function (e) { e.preventDefault(); toggleSidebar(); });
        if (mask) mask.addEventListener('click', function () { closeSidebar(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSidebar(); });

        document.getElementById('saveBtn').addEventListener('click', function () {
            saveConfig(currentCfg);
            dirty = false;
            updateSaveStatus();
            toast('success', '已保存', '更改已保存到浏览器，官网实时生效（此浏览器 localStorage）');
        });
        document.getElementById('resetBtn').addEventListener('click', function () {
            if (!confirm('确认恢复所有内容为默认配置？当前未保存和已保存的更改都会丢失。')) return;
            localStorage.removeItem(OVERRIDE_KEY);
            currentCfg = cloneJSON(DEFAULT_CFG);
            dirty = false;
            updateSaveStatus();
            rerenderCurrentTab();
            toast('success', '已恢复默认', '所有内容已重置为出厂配置');
        });
        document.getElementById('previewBtn').addEventListener('click', function () {
            closeSidebar();
            window.open('index.html', '_blank');
        });
        document.getElementById('logoutBtn').addEventListener('click', function () {
            if (dirty && !confirm('有未保存的更改，确认退出？')) return;
            clearAuth();
            location.reload();
        });
        document.getElementById('exportBtn').addEventListener('click', function () {
            closeSidebar();
            openExportModal();
        });
    }

    function bindModalClose() {
        const md = document.getElementById('exportModal');
        md.querySelectorAll('[data-modal], [data-modal-close]').forEach(function (el) {
            el.addEventListener('click', function () { closeModal(); });
        });
        document.getElementById('copyConfigBtn').addEventListener('click', function () {
            const ta = document.getElementById('exportTextarea');
            ta.select();
            document.execCommand('copy');
            toast('success', '已复制', '内容配置已复制，可直接粘贴到邮件或对接人员的聊天中发送。');
        });
        document.getElementById('downloadConfigBtn').addEventListener('click', function () {
            const ta = document.getElementById('exportTextarea');
            const blob = new Blob([ta.value], { type: 'application/javascript;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const now = new Date();
            const pad = function (n) { return String(n).padStart(2, '0'); };
            const stamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '-' + pad(now.getHours()) + pad(now.getMinutes());
            a.download = 'goldenrock-content-' + stamp + '.js';
            document.body.appendChild(a); a.click();
            setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 0);
            toast('success', '已下载', '内容配置包已保存，可直接发送给技术或部署团队上线使用。');
        });
    }

    function closeModal() {
        document.getElementById('exportModal').style.display = 'none';
    }

    function openExportModal() {
        const md = document.getElementById('exportModal');
        const ta = document.getElementById('exportTextarea');
        const finalCfg = cloneJSON(currentCfg);
        ta.value = generateConfigJS(finalCfg);
        md.style.display = 'flex';
    }

    function generateConfigJS(cfg) {
        return 'window.GOLDENROCK_CONFIG = ' +
               JSON.stringify(cfg, null, 2)
                   .replace(/</g, '\\u003C')
                   .replace(/>/g, '\\u003E') +
               ';\n';
    }

    /* ============ HELPERS ============ */
    function markDirty() {
        if (!dirty) {
            dirty = true;
            updateSaveStatus();
        }
    }
    function updateSaveStatus() {
        const el = document.getElementById('saveStatus');
        if (!el) return;
        if (dirty) { el.classList.remove('saved'); el.textContent = '未保存更改'; }
        else { el.classList.add('saved'); el.textContent = '已保存'; }
    }
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    function escAttr(s) { return esc(s).replace(/'/g, '&#39;'); }

    function toast(type, title, msg) {
        const c = document.getElementById('toastContainer');
        const el = document.createElement('div');
        el.className = 'toast ' + (type || '');
        const iconText = type === 'success' ? '✓' : type === 'error' ? '!' : type === 'warning' ? '!' : 'i';
        el.innerHTML =
            '<span class="toast-icon">' + iconText + '</span>' +
            '<div class="toast-body"><div class="toast-title">' + esc(title) + '</div>' +
            (msg ? '<div class="toast-msg">' + esc(msg) + '</div>' : '') + '</div>';
        c.appendChild(el);
        setTimeout(function () { el.remove(); }, 3100);
    }

    window.addEventListener('beforeunload', function (e) {
        if (dirty) {
            e.preventDefault();
            e.returnValue = '有未保存的更改，确定离开吗？';
        }
    });

})();
