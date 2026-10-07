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
        { id: 'site',        label: '站点设置',   icon: siteIcon(),   desc: '网站标题、关键词、品牌名称、品牌标语、登录密码等基础信息' },
        { id: 'brandLogo',   label: '品牌Logo',   icon: brandLogoIcon(), desc: '5 个使用场景独立编辑：顶部导航、页脚大卡、登录图标、Favicon、中文行（三语切换）' },
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
    function brandLogoIcon() { return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h4v4H4z"/><path d="M10 4h6v4h-6z"/><path d="M4 10h4v6H4z"/><path d="M10 10h6v2h-6z M10 14h6v2h-6z"/><circle cx="12" cy="12" r="0.5" fill="currentColor"/></svg>'; }
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
            ],
            brandLogo: [
                { sec: '使用说明', desc: '每个场景点「选择图片」上传即可（支持 PNG/JPG/SVG/WebP，建议透明 PNG 或 SVG 矢量）。系统自动保存为图片。不需要修改的场景留空即可，会自动使用 config.js 中的默认 Logo。' },
                { sec: '场景 1 · 顶部导航 / 法律页导航（Header）', desc: '建议尺寸：横向 Logo，高 44px 的矢量图（SVG）或 2× 分辨率 PNG。对应 Header 和法律页导航两处，同时生效。' },
                { key: 'brand.logoHeaderSvg',    label: '顶部导航 Logo',      type: 'file',
                  hint: '上传图片：推荐 SVG 或透明 PNG，建议宽度 400~800px，不要带多余的白边' },
                { sec: '场景 2 · Footer 品牌大卡（带中文行）', desc: '建议尺寸：横向整图，宽度约 800~1200px，矢量最佳。上传含 {{LOGO_CN}} 的 SVG 时，渲染时会按三语自动替换中文行；若上传普通 PNG/JPG 图，请直接把「金岩石有限公司」做在图片里。' },
                { key: 'brand.logoFooterSvgTpl', label: 'Footer 大卡 Logo',   type: 'file',
                  hint: '推荐 SVG 可保留 {{LOGO_CN}} 模板占位符自动切换三语；PNG/JPG 图请直接把公司名做死在图里' },
                { sec: '场景 3 · 纯石形图标（登录卡、侧栏、旧兜底）', desc: '建议尺寸：正方形 512×512，纯图标（无文字）。' },
                { key: 'brand.logoIconOnlySvg',  label: '纯图形 Logo（方）',   type: 'file',
                  hint: '单图形（无文字），用于登录卡图标、侧栏品牌图标等。推荐 SVG 矢量 + currentColor。' },
                { sec: '场景 4 · 浏览器标签页 Favicon', desc: '建议尺寸：方形 64×64 或 200×200，小图形 PNG/SVG/ICO。' },
                { key: 'site.faviconSvg',        label: 'Favicon（浏览器小图标）', type: 'file',
                  hint: '不要使用 currentColor（Favicon 无父容器颜色），直接做金色填充。' },
                { sec: '场景 5 · 登录页专属 Logo（白色背景）', desc: '建议尺寸：横向整图 500×120px，建议白底、深色字（登录卡片背景纯白）。此 Logo 仅用于后台登录卡顶部，不会影响首页（深蓝背景）的 Logo。' },
                { key: 'brand.loginLogoSvg',     label: '登录页 Logo（白底）',    type: 'file',
                  hint: '登录卡是白底，颜色要与纯白背景对比强烈（深蓝字/金色字）。留空则使用顶部导航 Logo 做兜底。' },
                { sec: '场景 6 · Footer 中文行（简中）', desc: '若 Footer 使用了带 {{LOGO_CN}} 的 SVG 模板，此处控制 zh_CN 的公司名显示；zh_TW/en 仍由三语字典维护。' },
                { key: 'brand.logoCn',           label: 'Footer 中文行（简中）',   type: 'text',
                  hint: '默认：金岩石有限公司。仅当 Footer 上传 SVG 模板（含 {{LOGO_CN}} 占位符）时生效；PNG 图请直接把文字做死在图片里' }
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

    function isImageDataUrl(s) {
        return typeof s === 'string' && s.indexOf('data:image/') === 0;
    }
    function renderBrandIconWrap(el, raw) {
        if (!el) return;
        if (isImageDataUrl(raw)) {
            const img = document.createElement('img');
            img.src = raw;
            img.alt = 'brand';
            img.style.cssText = 'display:block;max-width:100%;max-height:100%;height:100%;width:auto;object-fit:contain;';
            el.innerHTML = '';
            el.appendChild(img);
            return;
        }
        const html = String(raw || '').trim();
        if (!html) return;
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const svg = tmp.querySelector('svg');
        if (svg) {
            svg.style.color = '#B99642';
            el.innerHTML = '';
            el.appendChild(svg);
            return;
        }
        const img = tmp.querySelector('img');
        if (img) {
            el.innerHTML = '';
            img.style.cssText = 'display:block;max-width:100%;max-height:100%;height:100%;width:auto;object-fit:contain;';
            el.appendChild(img);
        }
    }
    function renderBrandIcons() {
        const iconRaw = (currentCfg && currentCfg.brand && currentCfg.brand.logoIconOnlySvg) || '';
        const loginRaw = (currentCfg && currentCfg.brand && currentCfg.brand.loginLogoSvg)
                      || (DEFAULT_CFG.brand && DEFAULT_CFG.brand.loginLogoSvg)
                      || (currentCfg && currentCfg.brand && currentCfg.brand.logoHeaderSvg)
                      || (DEFAULT_CFG.brand && DEFAULT_CFG.brand.logoHeaderSvg)
                      || '';
        const sidebar = document.getElementById('sidebarBrandIconWrap');
        if (sidebar && iconRaw) renderBrandIconWrap(sidebar, iconRaw);
        const loginHeader = document.getElementById('loginLogoHeaderWrap');
        if (loginHeader && loginRaw) renderBrandIconWrap(loginHeader, loginRaw);
    }

    /* ============ INIT ============ */
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        if (!checkAuth()) {
            document.getElementById('loginView').style.display = 'flex';
            document.getElementById('adminView').style.display = 'none';
            renderBrandIcons();
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
        bindCropControls();
        renderBrandIcons();
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
            renderedSchemaFields.push(f);
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
        } else if (f.type === 'file') {
            const cur = (typeof val === 'string') ? val : '';
            const previewBg = (f.key === 'brand.logoFooterSvgTpl') ? 'background: linear-gradient(135deg,#0A1628,#0f2140);' : 'background:#fff; border:1px solid #e6ebf5;';
            const ph = (f.key === 'brand.logoFooterSvgTpl') ? 108 : (f.key === 'site.faviconSvg' ? 32 : (f.key === 'brand.logoIconOnlySvg' ? 64 : (f.key === 'brand.loginLogoSvg' ? 80 : 48)));
            const hasVal = (cur && cur.length > 0) ? 1 : 0;
            inputHtml =
                '<div class="file-upload-block" style="display:flex; flex-direction:column; gap:10px;">' +
                    '<input type="file" id="' + id + '" data-key="' + f.key + '" accept="image/*,.svg,image/svg+xml" style="display:none;" class="file-upload-native">' +
                    '<div style="display:flex; align-items:center; gap:10px;">' +
                        '<button type="button" class="admin-btn-outline file-upload-pick" data-for="' + id + '">' +
                            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;display:inline-block;vertical-align:-2px;margin-right:6px;"><path d="M10 3v9m0 0l-3-3m3 3l3-3M4 14h12" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 17h14"/></svg>' +
                            '选择图片' +
                        '</button>' +
                        '<button type="button" class="admin-btn-secondary file-upload-clear" data-for="' + id + '" style="' + (hasVal ? '' : 'display:none;') + '">' +
                            '清除该场景（使用默认）' +
                        '</button>' +
                        '<span class="file-upload-info" style="color:#6b7a98; font-size:13px;" id="info_' + id + '">' + (hasVal ? '✅ 已上传图片（点击"选择图片"更换）' : '未上传，使用默认 Logo') + '</span>' +
                    '</div>' +
                    '<div class="svg-preview-block" style="display:flex; align-items:center; justify-content:center; padding:16px; border-radius:8px; ' + previewBg + ' height:' + (ph + 32) + 'px;">' +
                        '<div id="prev_' + id + '" data-preview-for="' + id + '" style="height:' + ph + 'px; width:100%; display:flex; align-items:center; justify-content:center; color:#B99642;">' + renderPreviewSnippet(cur, f) + '</div>' +
                    '</div>' +
                '</div>';
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

    function renderPreviewSnippet(rawVal, f) {
        if (rawVal == null || typeof rawVal !== 'string' || !rawVal.trim()) {
            return '<span style="color:' + (f && f.previewBg === 'dark' ? '#8898b8' : '#b8c1d8') + ';font-size:13px;letter-spacing:0.5px;">（未上传，使用 config.js 默认 Logo）</span>';
        }
        const txt = String(rawVal).trim();
        if (txt.indexOf('data:image/') === 0) {
            return '<img src="' + escAttr(txt) + '" style="max-height:100%; max-width:100%; display:block; object-fit:contain;">';
        }
        try {
            const tmp = document.createElement('div');
            tmp.innerHTML = txt;
            const svg = tmp.querySelector('svg');
            if (!svg) {
                if (txt.indexOf('<img') === 0 || txt.indexOf('http') === 0) {
                    return '<img src="' + escAttr(txt) + '" style="max-height:100%; max-width:100%;">';
                }
                return '<span style="color:#d7524e; font-size:13px;">⚠️ 未检测到合法 SVG 或图片，请重新上传</span>';
            }
            svg.style.maxHeight = '100%';
            svg.style.maxWidth = '100%';
            svg.style.height = '100%';
            svg.style.width = 'auto';
            if (svg.getAttribute('fill') === 'currentColor' || (svg.querySelector && svg.querySelector('[fill="currentColor"]'))) {
                svg.style.color = '#B99642';
            } else if (!svg.style.color) {
                svg.style.color = '#B99642';
            }
            if (f && f.key && String(f.key).indexOf('logoFooterSvgTpl') > -1 && txt.indexOf('{{LOGO_CN}}') > -1) {
                const cnVal = (currentCfg && currentCfg.brand) ? currentCfg.brand.logoCn : null;
                if (cnVal) svg.innerHTML = svg.innerHTML.replace(/\{\{LOGO_CN\}\}/g, String(cnVal));
            }
            return svg.outerHTML;
        } catch (e) {
            return '<span style="color:#d7524e; font-size:13px;">⚠️ 解析失败：' + esc(String(e && e.message || e)) + '</span>';
        }
    }

    function refreshSvgPreview(textareaEl) {
        if (!textareaEl) return;
        const pid = 'prev_' + textareaEl.id;
        const preview = document.getElementById(pid);
        if (!preview) return;
        const key = textareaEl.getAttribute('data-key');
        const f = (renderedSchemaFields && renderedSchemaFields.length) ? renderedSchemaFields.find(function (s) { return s.key === key; }) : null;
        preview.innerHTML = renderPreviewSnippet(textareaEl.value, f);
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
                if (el.classList && el.classList.contains('code-area')) {
                    refreshSvgPreview(el);
                }
            });
            if (el.type === 'checkbox') {
                el.addEventListener('change', function () {
                    const key = el.getAttribute('data-key');
                    setPath(currentCfg, key, el.checked);
                    markDirty();
                });
            }
            if (el.classList && el.classList.contains('file-upload-native')) {
                el.addEventListener('change', function () {
                    const key = el.getAttribute('data-key');
                    const file = el.files && el.files[0];
                    const info = document.getElementById('info_' + el.id);
                    const clearBtn = c.querySelector('.file-upload-clear[data-for="' + el.id + '"]');
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        const dataUrl = String(ev.target.result || '');
                        if (dataUrl.slice(0, 5) === 'data:' && dataUrl.indexOf('image/svg+xml') !== -1) {
                            // SVG 矢量图不裁剪，直接使用
                            setPath(currentCfg, key, dataUrl);
                            markDirty();
                            const f = (renderedSchemaFields && renderedSchemaFields.length) ? renderedSchemaFields.find(function (s) { return s.key === key; }) : null;
                            const preview = document.getElementById('prev_' + el.id);
                            if (preview) preview.innerHTML = renderPreviewSnippet(dataUrl, f);
                            if (info) info.textContent = '✅ 已上传 SVG：' + file.name + '（' + formatSize(file.size) + '）- 保存后生效（矢量图无需裁剪）';
                            if (clearBtn) clearBtn.style.display = '';
                            return;
                        }
                        // PNG/JPG/位图：打开裁剪弹窗
                        if (info) info.textContent = '⏳ 正在加载裁剪面板…';
                        openCropModal(dataUrl, {
                            name: file.name,
                            size: file.size,
                            inputId: el.id
                        }, key, key.split('.').pop());
                    };
                    reader.onerror = function () {
                        if (info) info.innerHTML = '<span style="color:#d7524e;">❌ 读取失败，请换一张图片</span>';
                    };
                    reader.readAsDataURL(file);
                });
            }
        });

        c.querySelectorAll('.file-upload-pick').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const id = btn.getAttribute('data-for');
                const fi = document.getElementById(id);
                if (fi && fi.click) fi.click();
            });
        });
        c.querySelectorAll('.file-upload-clear').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const id = btn.getAttribute('data-for');
                const fi = document.getElementById(id);
                const key = fi ? fi.getAttribute('data-key') : null;
                if (!key) return;
                setPath(currentCfg, key, '');
                markDirty();
                if (fi) fi.value = '';
                const f = (renderedSchemaFields && renderedSchemaFields.length) ? renderedSchemaFields.find(function (s) { return s.key === key; }) : null;
                const preview = document.getElementById('prev_' + id);
                if (preview) preview.innerHTML = renderPreviewSnippet('', f);
                const info = document.getElementById('info_' + id);
                if (info) info.textContent = '已清除，恢复使用默认 Logo';
                btn.style.display = 'none';
            });
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
            renderBrandIcons();
            toast('success', '已保存', '更改已保存到浏览器，官网实时生效（此浏览器 localStorage）');
        });
        document.getElementById('resetBtn').addEventListener('click', function () {
            if (!confirm('确认恢复所有内容为默认配置？当前未保存和已保存的更改都会丢失。')) return;
            localStorage.removeItem(OVERRIDE_KEY);
            currentCfg = cloneJSON(DEFAULT_CFG);
            dirty = false;
            updateSaveStatus();
            rerenderCurrentTab();
            renderBrandIcons();
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
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) exportBtn.addEventListener('click', function () {
            closeSidebar();
            openExportModal();
        });
    }

    function bindModalClose() {
        const md = document.getElementById('exportModal');
        if (!md) return;
        md.querySelectorAll('[data-modal], [data-modal-close]').forEach(function (el) {
            el.addEventListener('click', function () { closeModal(); });
        });
        const copyBtn = document.getElementById('copyConfigBtn');
        if (copyBtn) copyBtn.addEventListener('click', function () {
            const ta = document.getElementById('exportTextarea');
            if (!ta) return;
            ta.select();
            document.execCommand('copy');
            toast('success', '已复制', '内容配置已复制，可直接粘贴到邮件或对接人员的聊天中发送。');
        });
        const downBtn = document.getElementById('downloadConfigBtn');
        if (downBtn) downBtn.addEventListener('click', function () {
            const ta = document.getElementById('exportTextarea');
            if (!ta) return;
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
        const md = document.getElementById('exportModal');
        if (md) md.style.display = 'none';
    }

    function openExportModal() {
        const md = document.getElementById('exportModal');
        const ta = document.getElementById('exportTextarea');
        if (!md || !ta) return;
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

    // ================= 图片裁剪功能：Canvas + 鼠标拖动裁剪框 =================
    var CROP = {
        open: false,
        mode: null, // null / free / header(240:44) / footer(16:3) / square(1:1) / login(25:4)
        aspect: null, // number or null
        rawDataUrl: null,
        naturalW: 0,
        naturalH: 0,
        stageW: 0,
        stageH: 0,
        imgScale: 1,
        imgOffsetX: 0,
        imgOffsetY: 0,
        box: { x: 0, y: 0, w: 0, h: 0 },
        scalePercent: 100,
        outputFormat: 'image/png',
        pendingKey: null,
        pendingFileInputId: null,
        pendingFileName: '',
        pendingFileSize: 0
    };

    function getAspectRatioByKey(key) {
        switch (key) {
            case 'header': return 240 / 44;
            case 'footer': return 16 / 3;
            case 'square': return 1;
            case 'login':  return 25 / 4;
            case 'free':
            default: return null;
        }
    }

    function openCropModal(dataUrl, fileInfo, fieldKey, fieldLabel) {
        var modal = document.getElementById('cropModal');
        var img = document.getElementById('cropSource');
        if (!modal || !img) return toast('error', '裁剪功能不可用', '缺少 DOM 元素');

        CROP.rawDataUrl = dataUrl;
        CROP.pendingKey = fieldKey || null;
        CROP.pendingFileInputId = fileInfo.inputId || null;
        CROP.pendingFileName = fileInfo.name || '图片';
        CROP.pendingFileSize = fileInfo.size || 0;

        // 根据上传的字段自动推荐默认比例
        var defAspect = 'free';
        if (fieldKey === 'brand.logoHeaderSvg') defAspect = 'header';
        else if (fieldKey === 'brand.logoFooterSvgTpl') defAspect = 'footer';
        else if (fieldKey === 'brand.logoIconOnlySvg' || fieldKey === 'site.faviconSvg') defAspect = 'square';
        else if (fieldKey === 'brand.loginLogoSvg') defAspect = 'login';
        CROP.mode = defAspect;
        CROP.aspect = getAspectRatioByKey(defAspect);

        // 输出格式默认：PNG
        CROP.outputFormat = 'image/png';
        var fmtSel = document.getElementById('cropFormat');
        if (fmtSel) fmtSel.value = 'image/png';

        // 图片加载后：计算 stage 尺寸和 fit 显示
        var preImg = new Image();
        preImg.crossOrigin = 'anonymous';
        preImg.onload = function () {
            CROP.naturalW = preImg.naturalWidth || preImg.width;
            CROP.naturalH = preImg.naturalHeight || preImg.height;

            img.src = dataUrl;
            modal.style.display = 'flex';
            CROP.open = true;
            CROP.scalePercent = 100;
            var scaleSlider = document.getElementById('cropScale');
            var scaleLabel = document.getElementById('cropScaleLabel');
            if (scaleSlider) scaleSlider.value = 100;
            if (scaleLabel) scaleLabel.textContent = '100%';

            // 给下一个 event loop 等 layout 完成
            setTimeout(function () {
                layoutCropStage();
                // 激活对应比例 chip
                document.querySelectorAll('#cropModal .chip-btn').forEach(function (btn) {
                    btn.classList.toggle('active', btn.getAttribute('data-aspect') === CROP.mode);
                });
            }, 20);
        };
        preImg.onerror = function () {
            toast('error', '加载图片失败', '请换一个图片重试，或直接原图使用（不裁剪）');
            // 原图兜底：直接保存，跳过裁剪
            if (CROP.pendingKey) applyCropResult(dataUrl);
        };
        preImg.src = dataUrl;
    }

    function closeCropModal() {
        var modal = document.getElementById('cropModal');
        if (modal) modal.style.display = 'none';
        CROP.open = false;
        CROP.rawDataUrl = null;
    }

    function layoutCropStage() {
        var stage = document.getElementById('cropStage');
        var img = document.getElementById('cropSource');
        if (!stage || !img) return;

        var stageRect = stage.getBoundingClientRect();
        CROP.stageW = stageRect.width;
        CROP.stageH = stageRect.height;

        // 以「contain」方式放置原图居中，缩放系数 imgScale
        var ratio = Math.min(CROP.stageW / CROP.naturalW, CROP.stageH / CROP.naturalH);
        var baseScale = ratio;
        var scaleMult = CROP.scalePercent / 100;
        CROP.imgScale = baseScale * scaleMult;
        var dispW = CROP.naturalW * CROP.imgScale;
        var dispH = CROP.naturalH * CROP.imgScale;
        CROP.imgOffsetX = Math.round((CROP.stageW - dispW) / 2);
        CROP.imgOffsetY = Math.round((CROP.stageH - dispH) / 2);

        img.style.left = CROP.imgOffsetX + 'px';
        img.style.top = CROP.imgOffsetY + 'px';
        img.style.width = dispW + 'px';
        img.style.height = dispH + 'px';

        // 默认裁剪框：图片 80% 居中（按固定比例时，调整大小）
        var padding = 0.1;
        var boxW = dispW * (1 - padding * 2);
        var boxH = dispH * (1 - padding * 2);
        if (CROP.aspect) {
            if (boxW / boxH > CROP.aspect) {
                boxW = boxH * CROP.aspect;
            } else {
                boxH = boxW / CROP.aspect;
            }
        }
        var bx = Math.round((CROP.stageW - boxW) / 2);
        var by = Math.round((CROP.stageH - boxH) / 2);
        // 约束在图片显示区域内
        var constraint = {
            x1: CROP.imgOffsetX,
            y1: CROP.imgOffsetY,
            x2: CROP.imgOffsetX + dispW,
            y2: CROP.imgOffsetY + dispH
        };
        // 若裁剪框初始超界，缩小
        if (boxW > (constraint.x2 - constraint.x1)) {
            boxW = constraint.x2 - constraint.x1;
            if (CROP.aspect) boxH = boxW / CROP.aspect;
        }
        if (boxH > (constraint.y2 - constraint.y1)) {
            boxH = constraint.y2 - constraint.y1;
            if (CROP.aspect) boxW = boxH * CROP.aspect;
        }
        bx = Math.round((CROP.stageW - boxW) / 2);
        by = Math.round((CROP.stageH - boxH) / 2);
        CROP.box = { x: bx, y: by, w: Math.round(boxW), h: Math.round(boxH) };
        renderCropBox();
    }

    function renderCropBox() {
        var box = document.getElementById('cropBox');
        if (!box) return;
        box.style.left = CROP.box.x + 'px';
        box.style.top = CROP.box.y + 'px';
        box.style.width = CROP.box.w + 'px';
        box.style.height = CROP.box.h + 'px';
        renderCropInfo();
    }

    function renderCropInfo() {
        var info = document.getElementById('cropInfo');
        var output = document.getElementById('cropOutputInfo');
        var dispW = Math.round(CROP.naturalW * CROP.imgScale);
        var dispH = Math.round(CROP.naturalH * CROP.imgScale);

        // 选框在屏幕上的像素 / 对应实际自然尺寸
        var bxInImgX = CROP.box.x - CROP.imgOffsetX;
        var bxInImgY = CROP.box.y - CROP.imgOffsetY;
        var natX = Math.round(bxInImgX / CROP.imgScale);
        var natY = Math.round(bxInImgY / CROP.imgScale);
        var natW = Math.round(CROP.box.w / CROP.imgScale);
        var natH = Math.round(CROP.box.h / CROP.imgScale);
        if (natX < 0) natX = 0;
        if (natY < 0) natY = 0;
        if (natX + natW > CROP.naturalW) natW = CROP.naturalW - natX;
        if (natY + natH > CROP.naturalH) natH = CROP.naturalH - natY;

        if (info) info.textContent = '选框：' + CROP.box.w + ' × ' + CROP.box.h + '　原图：' + CROP.naturalW + ' × ' + CROP.naturalH + '（显示 ' + dispW + '×' + dispH + '）';
        if (output) output.textContent = '输出：' + Math.max(natW, 0) + ' × ' + Math.max(natH, 0) + ' px （比例 ' + (natH > 0 ? (natW / natH).toFixed(2) : '—') + '）';
    }

    // ================= 裁剪框交互：拖动 / 8 把手调整 =================
    var CROP_GESTURE = {
        active: false,
        type: null, // move / resize
        dir: null, // n/s/e/w/nw/ne/sw/se
        startX: 0, startY: 0,
        startBox: null,
        min: 24
    };

    function bindCropGestures() {
        var box = document.getElementById('cropBox');
        var stage = document.getElementById('cropStage');
        if (!box || !stage) return;
        box.addEventListener('mousedown', startCropGesture);
        box.addEventListener('touchstart', startCropGesture, { passive: false });
        window.addEventListener('mousemove', moveCropGesture);
        window.addEventListener('touchmove', moveCropGesture, { passive: false });
        window.addEventListener('mouseup', endCropGesture);
        window.addEventListener('touchend', endCropGesture);
        window.addEventListener('touchcancel', endCropGesture);
    }

    function startCropGesture(e) {
        e.preventDefault();
        e.stopPropagation();
        var pt = getPointer(e);
        var target = e.target;
        CROP_GESTURE.startX = pt.x;
        CROP_GESTURE.startY = pt.y;
        CROP_GESTURE.startBox = { x: CROP.box.x, y: CROP.box.y, w: CROP.box.w, h: CROP.box.h };
        CROP_GESTURE.active = true;
        var dir = target && target.getAttribute && target.getAttribute('data-dir');
        if (dir) {
            CROP_GESTURE.type = 'resize';
            CROP_GESTURE.dir = dir;
        } else {
            CROP_GESTURE.type = 'move';
            CROP_GESTURE.dir = null;
        }
    }

    function getPointer(e) {
        if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        return { x: e.clientX || 0, y: e.clientY || 0 };
    }

    function clampBox() {
        var imgRight = CROP.imgOffsetX + CROP.naturalW * CROP.imgScale;
        var imgBottom = CROP.imgOffsetY + CROP.naturalH * CROP.imgScale;
        var minX = CROP.imgOffsetX;
        var minY = CROP.imgOffsetY;
        var maxX2 = imgRight;
        var maxY2 = imgBottom;

        if (CROP.box.w < CROP_GESTURE.min) CROP.box.w = CROP_GESTURE.min;
        if (CROP.box.h < CROP_GESTURE.min) CROP.box.h = CROP_GESTURE.min;
        if (CROP.box.x < minX) CROP.box.x = minX;
        if (CROP.box.y < minY) CROP.box.y = minY;
        if (CROP.box.x + CROP.box.w > maxX2) CROP.box.x = Math.round(maxX2 - CROP.box.w);
        if (CROP.box.y + CROP.box.h > maxY2) CROP.box.y = Math.round(maxY2 - CROP.box.h);
        if (CROP.box.x < minX) CROP.box.x = minX;
        if (CROP.box.y < minY) CROP.box.y = minY;
    }

    function moveCropGesture(e) {
        if (!CROP_GESTURE.active) return;
        e.preventDefault();
        var pt = getPointer(e);
        var dx = pt.x - CROP_GESTURE.startX;
        var dy = pt.y - CROP_GESTURE.startY;
        var sb = CROP_GESTURE.startBox;
        var box = { x: sb.x, y: sb.y, w: sb.w, h: sb.h };

        if (CROP_GESTURE.type === 'move') {
            box.x = sb.x + Math.round(dx);
            box.y = sb.y + Math.round(dy);
        } else if (CROP_GESTURE.type === 'resize') {
            var dir = CROP_GESTURE.dir;
            var newW = sb.w, newH = sb.h, newX = sb.x, newY = sb.y;
            if (dir.indexOf('e') !== -1) newW = sb.w + Math.round(dx);
            if (dir.indexOf('s') !== -1) newH = sb.h + Math.round(dy);
            if (dir.indexOf('w') !== -1) { newW = sb.w - Math.round(dx); newX = sb.x + (sb.w - newW); }
            if (dir.indexOf('n') !== -1) { newH = sb.h - Math.round(dy); newY = sb.y + (sb.h - newH); }
            if (newW < CROP_GESTURE.min) {
                if (dir.indexOf('w') !== -1) newX = sb.x + sb.w - CROP_GESTURE.min;
                newW = CROP_GESTURE.min;
            }
            if (newH < CROP_GESTURE.min) {
                if (dir.indexOf('n') !== -1) newY = sb.y + sb.h - CROP_GESTURE.min;
                newH = CROP_GESTURE.min;
            }
            // 固定比例：调整后同步另一维度
            if (CROP.aspect) {
                if (newW / newH > CROP.aspect) {
                    // 太宽 → 宽度收缩并调整左（若 w 侧参与则推 x）
                    var newW2 = Math.round(newH * CROP.aspect);
                    if (dir.indexOf('w') !== -1) newX = newX + (newW - newW2);
                    newW = newW2;
                } else {
                    // 太高 → 高度收缩
                    var newH2 = Math.round(newW / CROP.aspect);
                    if (dir.indexOf('n') !== -1) newY = newY + (newH - newH2);
                    newH = newH2;
                }
            }
            box.w = newW; box.h = newH; box.x = newX; box.y = newY;
        }

        CROP.box = box;
        clampBox();
        renderCropBox();
    }

    function endCropGesture() {
        CROP_GESTURE.active = false;
    }

    // ================= 裁剪弹窗控件绑定 =================
    function bindCropControls() {
        var closeBtn = document.getElementById('cropCloseBtn');
        var cancelBtn = document.getElementById('cropCancelBtn');
        var confirmBtn = document.getElementById('cropConfirmBtn');
        if (closeBtn) closeBtn.addEventListener('click', function () { closeCropModal(); });
        if (cancelBtn) cancelBtn.addEventListener('click', function () { closeCropModal(); });
        var modal = document.getElementById('cropModal');
        if (modal) {
            var mask = modal.querySelector('.crop-modal-mask');
            if (mask) mask.addEventListener('click', function () { closeCropModal(); });
        }
        document.querySelectorAll('#cropModal .chip-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var asp = btn.getAttribute('data-aspect') || 'free';
                setCropAspect(asp);
            });
        });
        var scaleSlider = document.getElementById('cropScale');
        var scaleLabel = document.getElementById('cropScaleLabel');
        if (scaleSlider) {
            scaleSlider.addEventListener('input', function () {
                var v = parseInt(scaleSlider.value, 10) || 100;
                CROP.scalePercent = v;
                if (scaleLabel) scaleLabel.textContent = v + '%';
                layoutCropStage();
            });
        }
        var fmtSel = document.getElementById('cropFormat');
        if (fmtSel) {
            fmtSel.addEventListener('change', function () {
                CROP.outputFormat = fmtSel.value || 'image/png';
                renderCropInfo();
            });
        }
        if (confirmBtn) confirmBtn.addEventListener('click', performCrop);

        window.addEventListener('resize', function () {
            if (!CROP.open) return;
            setTimeout(function () { layoutCropStage(); }, 60);
        });

        bindCropGestures();
    }

    function setCropAspect(aspKey) {
        CROP.mode = aspKey;
        CROP.aspect = getAspectRatioByKey(aspKey);
        document.querySelectorAll('#cropModal .chip-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-aspect') === aspKey);
        });
        // 按新比例调整当前裁剪框（以中心为基准、尽量放大、不超图）
        var cx = CROP.box.x + CROP.box.w / 2;
        var cy = CROP.box.y + CROP.box.h / 2;
        var w = CROP.box.w;
        var h = CROP.box.h;
        if (CROP.aspect) {
            if (w / h > CROP.aspect) w = Math.round(h * CROP.aspect);
            else h = Math.round(w / CROP.aspect);
        }
        CROP.box = {
            x: Math.round(cx - w / 2),
            y: Math.round(cy - h / 2),
            w: w,
            h: h
        };
        clampBox();
        renderCropBox();
    }

    // ================= Canvas 执行裁剪 =================
    function performCrop() {
        if (!CROP.open) return;
        if (!CROP.rawDataUrl) return closeCropModal();

        var bxInImgX = (CROP.box.x - CROP.imgOffsetX) / CROP.imgScale;
        var bxInImgY = (CROP.box.y - CROP.imgOffsetY) / CROP.imgScale;
        var bxW = CROP.box.w / CROP.imgScale;
        var bxH = CROP.box.h / CROP.imgScale;

        var sx = Math.max(0, Math.round(bxInImgX));
        var sy = Math.max(0, Math.round(bxInImgY));
        var sw = Math.round(bxW);
        var sh = Math.round(bxH);
        if (sx + sw > CROP.naturalW) sw = CROP.naturalW - sx;
        if (sy + sh > CROP.naturalH) sh = CROP.naturalH - sy;
        if (sw <= 1 || sh <= 1) {
            toast('error', '选框过小', '请把裁剪框拉大一些再确认');
            return;
        }

        // 读源图，绘制到 Canvas
        var sourceImg = new Image();
        sourceImg.crossOrigin = 'anonymous';
        sourceImg.onload = function () {
            try {
                var canvas = document.createElement('canvas');
                canvas.width = sw;
                canvas.height = sh;
                var ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('no canvas context');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, sw, sh);
                var mime = CROP.outputFormat === 'image/jpeg' ? 'image/jpeg' : 'image/png';
                var quality = mime === 'image/jpeg' ? 0.94 : undefined;
                var out = canvas.toDataURL(mime, quality);
                if (!out || out.length < 100) throw new Error('canvas toDataURL failed');
                applyCropResult(out);
            } catch (err) {
                console.warn('裁剪失败，使用原图兜底：', err);
                toast('warning', '裁剪失败', '已使用原图，您可到预览中查看是否需要重新上传。');
                applyCropResult(CROP.rawDataUrl);
            }
        };
        sourceImg.onerror = function () {
            toast('error', '处理图片失败', '请换一张图片或刷新后重试');
            applyCropResult(CROP.rawDataUrl);
        };
        sourceImg.src = CROP.rawDataUrl;
    }

    function applyCropResult(resultDataUrl) {
        var key = CROP.pendingKey;
        var inputId = CROP.pendingFileInputId;
        if (!key) { closeCropModal(); return; }
        setPath(currentCfg, key, resultDataUrl);
        markDirty();
        // 刷新预览 + 信息
        var container = document.getElementById('formContainer');
        var fi = document.getElementById(inputId);
        if (fi) {
            var f = (renderedSchemaFields && renderedSchemaFields.length) ? renderedSchemaFields.find(function (s) { return s.key === key; }) : null;
            var preview = document.getElementById('prev_' + inputId);
            if (preview) preview.innerHTML = renderPreviewSnippet(resultDataUrl, f);
            var info = document.getElementById('info_' + inputId);
            if (info) {
                var sizeStr = CROP.pendingFileSize ? ('原图 ' + formatSize(CROP.pendingFileSize) + '，') : '';
                info.textContent = '✅ 已裁剪：' + (CROP.pendingFileName || '图片') + '（' + sizeStr + '保存后生效）';
            }
            var clearBtn = container ? container.querySelector('.file-upload-clear[data-for="' + inputId + '"]') : null;
            if (clearBtn) clearBtn.style.display = '';
        }
        closeCropModal();
    }

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
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function escAttr(s) { return esc(s).replace(/'/g, '&#39;'); }
    function formatSize(bytes) {
        if (bytes == null || isNaN(bytes)) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

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
