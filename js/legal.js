(function () {
    'use strict';

    const PAGE_ID = (function detectPageId() {
        const loc = window.location.pathname.split('/').pop().toLowerCase();
        if (loc.indexOf('privacy') >= 0) return 'privacy';
        if (loc.indexOf('terms') >= 0 || loc.indexOf('service') >= 0) return 'terms';
        if (loc.indexOf('disclaimer') >= 0) return 'disclaimer';
        const hash = (window.location.hash || '').replace('#', '').toLowerCase();
        if (['privacy', 'terms', 'disclaimer'].indexOf(hash) >= 0) return hash;
        return 'privacy';
    })();

    function _it(key, fb) {
        if (window.I18N && typeof window.I18N.t === 'function') return window.I18N.t(key, fb);
        return fb != null ? fb : ('[' + key + ']');
    }

    function cloneJSON(o) { return JSON.parse(JSON.stringify(o == null ? {} : o)); }
    function _dM(t, s) {
        if (!s || typeof s !== 'object') return t;
        const o = Array.isArray(t) ? t.slice() : Object.assign({}, t);
        Object.keys(s).forEach(function (k) {
            const sv = s[k], tv = o[k];
            if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
                o[k] = _dM(tv, sv);
            } else o[k] = cloneJSON(sv);
        });
        return o;
    }

    function getRawCfg() {
        if (window.I18N && typeof window.I18N.___rawBaseCfg === 'function') return window.I18N.___rawBaseCfg();
        const base = cloneJSON(window.GOLDENROCK_CONFIG || {});
        try {
            const s = localStorage.getItem('GOLDENROCK_CONFIG_OVERRIDE');
            if (s) return _dM(base, JSON.parse(s));
        } catch (e) { console.warn(e); }
        return base;
    }

    const CONFIG = (function loadConfig() {
        if (window.I18N && typeof window.I18N.getConfig === 'function') {
            return window.I18N.getConfig();
        }
        return getRawCfg();
    })();

    const RAW_CFG = getRawCfg();

    const PAGE = (CONFIG.legal && CONFIG.legal[PAGE_ID]) || {};

    function isImageDataUrl(s) {
        return typeof s === 'string' && s.indexOf('data:image/') === 0;
    }
    function buildLogoImgHtml(raw) {
        if (isImageDataUrl(raw)) {
            return '<img src="' + raw + '" alt="logo" style="display:block;max-width:100%;max-height:100%;height:100%;width:auto;object-fit:contain;">';
        }
        return String(raw || '');
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function nl2br(s) {
        return esc(s).replace(/\r?\n/g, '<br>');
    }

    function formatDate(s) {
        if (!s) return '';
        const d = new Date(String(s).replace(/-/g, '/'));
        if (isNaN(d.getTime())) return s;
        const locale = _it('ui.dateFormat.locale', 'zh-CN');
        try {
            if (locale === 'zh-CN') {
                return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
            }
            if (locale === 'zh-TW') {
                return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
            }
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
    }

    function renderHead() {
        document.title = (PAGE.pageTitle || '法律文件') + ' | ' + ((CONFIG.brand && CONFIG.brand.logoCn) || '金岩石') +
            (CONFIG.brand ? (' ' + (CONFIG.brand.logoEnFull || CONFIG.brand.logoEn || '')) : '');
        if (PAGE.metaDescription) {
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'description');
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', PAGE.metaDescription);
        }
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', PAGE.pageTitle || '');
    }

    function renderNavbar() {
        const logoHeader = (RAW_CFG && RAW_CFG.brand && RAW_CFG.brand.logoHeaderSvg)
                        || (CONFIG.brand && CONFIG.brand.logoHeaderSvg)
                        || '';
        const nav = document.getElementById('lpNav');
        if (!nav) return;
        nav.innerHTML =
            '<div class="lp-nav-inner">' +
              '<a href="index.html" class="lp-logo">' +
                '<div class="lp-logo-header-img">' + buildLogoImgHtml(logoHeader) + '</div>' +
              '</a>' +
              '<nav class="lp-nav-links">' +
                (PAGE_ID !== 'privacy' ? '<a href="privacy.html">' + _it('ui.legalNav.privacy', '隐私政策') + '</a>' : '') +
                (PAGE_ID !== 'terms' ? '<a href="terms.html">' + _it('ui.legalNav.terms', '服务条款') + '</a>' : '') +
                (PAGE_ID !== 'disclaimer' ? '<a href="disclaimer.html">' + _it('ui.legalNav.disclaimer', '免责声明') + '</a>' : '') +
                '<a href="index.html" class="home-link">' +
                  '<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h12M12 6l4 4-4 4"/></svg>' +
                  '<span>' + _it('ui.legalNav.backHome', '返回官网') + '</span>' +
                '</a>' +
              '</nav>' +
            '</div>';
    }

    function renderHero() {
        const el = document.getElementById('lpHero');
        if (!el) return;
        el.innerHTML =
            '<div class="lp-hero-inner">' +
              '<nav class="lp-breadcrumb">' +
                '<a href="index.html">' + _it('ui.legalNav.home', '首页') + '</a><span class="sep">›</span>' +
                '<span class="current">' + esc(PAGE.pageTitle || '法律文件') + '</span>' +
              '</nav>' +
              '<h1 class="lp-title">' + esc(PAGE.pageTitle || '') + '</h1>' +
              '<div class="lp-title-en">' + esc(PAGE.pageTitleEn || '') + '</div>' +
              '<div class="lp-meta">' +
                '<div class="lp-meta-item"><span class="lp-meta-label">' + _it('ui.legalNav.company', '公司') + '</span><span class="lp-meta-value company">' + esc(PAGE.companyName || '') + '</span></div>' +
                '<div class="lp-meta-item"><span class="lp-meta-label">' + _it('ui.legalNav.effectiveDate', '生效日期') + '</span><span class="lp-meta-value">' + formatDate(PAGE.effectiveDate) + '</span></div>' +
                '<div class="lp-meta-item"><span class="lp-meta-label">' + _it('ui.legalNav.lastUpdated', '最后更新') + '</span><span class="lp-meta-value">' + formatDate(PAGE.lastUpdated) + '</span></div>' +
              '</div>' +
            '</div>';
    }

    function sectionId(i, t) {
        if (t && t.length) {
            const slug = String(t).trim().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
            return 'section-' + (i + 1) + '-' + (slug || 'item');
        }
        return 'section-' + (i + 1);
    }

    function renderContent() {
        const introEl = document.getElementById('lpIntro');
        if (introEl) introEl.innerHTML = nl2br(PAGE.intro || '');

        const sections = Array.isArray(PAGE.sections) ? PAGE.sections : [];
        const container = document.getElementById('lpContent');
        const tocUl = document.getElementById('lpTocList');
        if (tocUl) {
            tocUl.innerHTML = sections.map(function (s, i) {
                const id = sectionId(i, s.title);
                return '<li><a href="#' + id + '" data-scroll="' + id + '">' + esc(s.title) + '</a></li>';
            }).join('');
        }
        if (container) {
            container.innerHTML = sections.map(function (s, i) {
                const id = sectionId(i, s.title);
                const paragraphs = Array.isArray(s.paragraphs) ? s.paragraphs : [];
                return '<section class="lp-section" id="' + id + '">' +
                    '<h2 class="lp-section-title">' + esc(s.title) + '</h2>' +
                    paragraphs.map(function (p) {
                        return '<p>' + nl2br(p) + '</p>';
                    }).join('') +
                    '</section>';
            }).join('');
        }
    }

    function renderFooter() {
        const el = document.getElementById('lpFooter');
        if (!el) return;
        const links = CONFIG.footer && Array.isArray(CONFIG.footer.links) ? CONFIG.footer.links : [];
        const linkMap = { privacy: 'privacy.html', terms: 'terms.html', disclaimer: 'disclaimer.html' };
        el.innerHTML =
            '<div class="lp-footer-inner">' +
                '<div class="lp-footer-links">' +
                    links.map(function (l) {
                        const href = l.href || '#';
                        const isCur = (href === linkMap[PAGE_ID]) || (href.indexOf(PAGE_ID + '.html') >= 0);
                        return '<a href="' + escAttr(href) + '" class="' + (isCur ? 'current' : '') + '">' + esc(l.text) + '</a>';
                    }).join('') +
                '</div>' +
                '<div class="lp-footer-copy">' + esc((CONFIG.footer && CONFIG.footer.copyright) || '') + '</div>' +
                '<div class="lp-footer-regulator">' + esc((CONFIG.footer && CONFIG.footer.regulatorNote) || '') + '</div>' +
            '</div>';
    }

    function escAttr(s) { return esc(s).replace(/'/g, '&#39;'); }

    function bindInteractions() {
        const backToTop = document.getElementById('lpBackToTop');
        if (backToTop) {
            window.addEventListener('scroll', function () {
                if (window.scrollY > 400) backToTop.classList.add('show');
                else backToTop.classList.remove('show');
            }, { passive: true });
            backToTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        const tocLinks = document.querySelectorAll('#lpTocList a[data-scroll]');
        const sections = document.querySelectorAll('.lp-section');
        tocLinks.forEach(function (a) {
            a.addEventListener('click', function (e) {
                const id = a.getAttribute('data-scroll');
                const t = document.getElementById(id);
                if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        });
        window.addEventListener('scroll', function () {
            const y = window.scrollY + 120;
            let cur = null;
            sections.forEach(function (s) {
                if (s.offsetTop <= y) cur = s.id;
            });
            tocLinks.forEach(function (a) {
                a.classList.toggle('active', a.getAttribute('data-scroll') === cur);
            });
        }, { passive: true });
    }

    function init() {
        if (!PAGE || !PAGE.pageTitle) {
            document.write('<h1 style="color:#c00;padding:40px;font-family:sans-serif;">未找到对应法律文件配置 (pageId=' + PAGE_ID + ')</h1>');
            return;
        }
        renderHead();
        renderNavbar();
        renderHero();
        renderContent();
        renderFooter();
        if (window.I18N && typeof window.I18N.applyI18nAttrs === 'function') {
            window.I18N.applyI18nAttrs(document);
        }
        bindInteractions();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
