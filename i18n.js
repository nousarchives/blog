const TRANSLATIONS = {
    es: {
        'nav.established':      'EST. NOV 25',
        'nav.darkmode':         'Modo oscuro',
        'nav.archive':          'Archivo',
        'nav.back':             '← NousArchives',
        'drawer.posts':         'Publicaciones',
        'drawer.yt':            'YouTube',
        'drawer.authors':       'Autores',
        'folder.ml':            'ML/AI',
        'folder.guion':         'Guión',
        'folder.cine':          'Cine',
        'folder.economia':      'Economía',
        'folder.musica':        'Música',
        'author.entries.one':   'entrada',
        'author.entries.other': 'entradas',
        'author.entries.empty': '— entradas',
        'posts.featured':       'Última entrada',
        'posts.empty':          'Nada en esta sección todavía.',
        'archive.title':        'Archivo',
        'archive.subtitle':     'Todas las entradas por orden cronológico',
        'archive.nodate':       'Sin fecha',
        'section.allposts':     'Todas las entradas',
        'section.related':      'También en NousArchives',
        'section.toc':          'Índice',
        'section.opentopics':   'Current Open Topics',
        'article.words':        'palabras',
        'backtotop':            'Volver arriba',
        'footer.content':       'Contenido bajo',
        'footer.code':          'Código bajo',
        'footer.design':        'Diseñado por Ángel Allepuz',
        'hero.volume':          'Volumen I',
        'empty.author':         'Todavía no hay nada por aquí.\nPero el silencio también dice algo.',
    },
    en: {
        'nav.established':      'EST. NOV 25',
        'nav.darkmode':         'Dark mode',
        'nav.archive':          'Archive',
        'nav.back':             '← NousArchives',
        'drawer.posts':         'Posts',
        'drawer.yt':            'YouTube',
        'drawer.authors':       'Authors',
        'folder.ml':            'ML/AI',
        'folder.guion':         'Script',
        'folder.cine':          'Film',
        'folder.economia':      'Economics',
        'folder.musica':        'Music',
        'author.entries.one':   'post',
        'author.entries.other': 'posts',
        'author.entries.empty': '— posts',
        'posts.featured':       'Latest post',
        'posts.empty':          'Nothing here yet.',
        'archive.title':        'Archive',
        'archive.subtitle':     'All posts in chronological order',
        'archive.nodate':       'No date',
        'section.allposts':     'All posts',
        'section.related':      'Also on NousArchives',
        'section.toc':          'Contents',
        'section.opentopics':   'Current Open Topics',
        'article.words':        'words',
        'backtotop':            'Back to top',
        'footer.content':       'Content under',
        'footer.code':          'Code under',
        'footer.design':        'Designed by Ángel Allepuz',
        'hero.volume':          'Volume I',
        'empty.author':         'Nothing here yet.\nBut silence says something too.',
    },
};

(function () {
    function detectLang() {
        const saved = localStorage.getItem('lang');
        if (saved === 'es' || saved === 'en') return saved;
        const nav = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
        return nav.startsWith('es') ? 'es' : 'en';
    }

    function applyLang(lang) {
        const t = TRANSLATIONS[lang] || TRANSLATIONS.es;
        localStorage.setItem('lang', lang);
        document.documentElement.setAttribute('lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (!(key in t)) return;
            const val = t[key];
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = val;
            } else if (el.hasAttribute('aria-label')) {
                el.setAttribute('aria-label', val);
            } else {
                el.textContent = val;
            }
        });

        // Dual-target elements: both aria-label and textContent
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.dataset.i18nAria;
            if (key in t) el.setAttribute('aria-label', t[key]);
        });

        // Update lang toggle button label
        const btn = document.getElementById('lang-toggle');
        if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';

        // Update <html lang> for screen readers
        document.documentElement.lang = lang;
    }

    function toggleLang() {
        const current = localStorage.getItem('lang') || detectLang();
        applyLang(current === 'es' ? 'en' : 'es');
    }

    // Expose globally so inline scripts can call applyLang for dynamic content
    window.i18n = {
        t: function(key) {
            const lang = localStorage.getItem('lang') || detectLang();
            return (TRANSLATIONS[lang] || TRANSLATIONS.es)[key] || key;
        },
        apply: applyLang,
        toggle: toggleLang,
        lang: detectLang,
    };

    // Apply on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyLang(detectLang()));
    } else {
        applyLang(detectLang());
    }
})();
