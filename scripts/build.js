const fs = require('fs');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

marked.setOptions({ headerIds: false, mangle: false });

const AUTHORS = {
    angel: {
        name: 'Ángel Allepuz',
        initial: 'Á',
        bodyClass: 'angel-page',
        // Terminal hero (term-hero.js): name in box-drawing letters that scrambles into the thesis on scroll
        terminalHero: {
            fullName: 'Ángel Allepuz Conesa',
            namePrompt: 'angel@nousarchives:~$ whoami',
            nameWords: ['Ángel', 'Allepuz', 'Conesa'],
            nameTagline: 'MLOps / DevOps Engineer',
            thesisPrompt: 'angel@nousarchives:~$ cat thesis.txt',
            thesisArt: ['AI should', 'be open'],
            thesisText: ['Open models on cheap machines.', 'Prediction is a commodity like water.', 'We all should be able to drink it.'],
        },
        projects: [
            {
                title: 'π-chón',
                year: '2026',
                kind: 'Hardware + LLM',
                claim: { es: 'Pequeño sobre pequeño', en: 'Small on small' },
                url: 'https://github.com/allepuzz/pichon',
                desc: {
                    es: 'Un diario hablado que sale en papel. Lo dictas de noche; un LLM local en una Raspberry Pi 5 lo destila; a las 9:00 un ESP32 lo imprime en una térmica de 58 mm. Sin nube, sin APIs de terceros.',
                    en: 'A spoken diary that comes out on paper. You dictate at night; a local LLM on a Raspberry Pi 5 distills it; at 9:00 an ESP32 prints it on a 58 mm thermal printer. No cloud, no third-party APIs.',
                },
                fact: {
                    es: '7 modelos abiertos probados, de 2B a 9B parámetros. Ninguno resolvía la tarea solo; el harness sí, sobre el de 3B.',
                    en: '7 open models tested, from 2B to 9B parameters. None solved the task alone; the harness did, on the 3B one.',
                },
                stack: ['Python', 'C++', 'Ollama', 'whisper.cpp', 'Flask', 'Raspberry Pi 5', 'ESP32'],
            },
            {
                title: 'citrus-scout',
                year: '2026',
                kind: 'MLOps',
                claim: { es: 'Para quien no paga APIs', en: 'For those who don\'t pay for APIs' },
                url: 'https://github.com/allepuzz/citrus-scout',
                desc: {
                    es: 'Pipeline MLOps para detectar plagas y enfermedades en cítricos desde dron, pensado para cooperativas de la Región de Murcia (28.442 ha de limonero), donde hoy la inspección se hace a pie y por muestreo.',
                    en: 'MLOps pipeline for pest and disease detection in citrus groves from drone imagery, aimed at cooperatives in the Region of Murcia (28,442 ha of lemon trees), where scouting is still done on foot and by sampling.',
                },
                fact: {
                    es: 'Fase 0: entrena, evalúa, calibra, cuantifica incertidumbre y muestra dónde mira el modelo. Se mide PPV a prevalencia real, no accuracy. El cuello de botella ahora son los datos UAV reales.',
                    en: 'Phase 0: trains, evaluates, calibrates, quantifies uncertainty and shows where the model looks. Measured by PPV at real prevalence, not accuracy. The bottleneck now is real UAV data.',
                },
                stack: ['Python', 'PyTorch', 'Grad-CAM', 'W&B', 'DVC', 'uv'],
            },
            {
                title: 'Mar Menor Health Predictor',
                year: 'TFG',
                kind: 'ML',
                claim: { es: 'Datos públicos, un portátil', en: 'Public data, one laptop' },
                url: 'https://github.com/allepuzz/Mar-Menor-Health-Predictor',
                desc: {
                    es: 'Mi TFG. Predicción de clorofila-α, nitratos y fosfatos en el Mar Menor con datos públicos de la UPCT y la Fundación Canal Mar Menor, contrastada con los umbrales legales. Todo entrenado en un portátil.',
                    en: 'My bachelor\'s thesis. Forecasting chlorophyll-α, nitrates and phosphates in the Mar Menor lagoon from public UPCT and Fundación Canal Mar Menor data, checked against legal thresholds. All trained on a laptop.',
                },
                fact: {
                    es: 'Random Forest con lags y validación de ventana expansiva. MSE en clorofila-α: 1,211 frente a 3,671 (SARIMA) y 5,316 (regresión lineal).',
                    en: 'Random Forest with lag features and expanding-window validation. Chlorophyll-α MSE: 1.211 vs 3.671 (SARIMA) and 5.316 (linear regression).',
                },
                stack: ['Python', 'scikit-learn', 'statsmodels', 'pandas'],
            },
        ],
        certs: [
            { label: 'certs', items: [
                'Google Cloud · Professional Cloud Architect',
                'Google Cloud · Associate Cloud Engineer',
                'AWS · AI Practitioner',
                'GitHub Actions',
            ] },
            { label: { es: 'idiomas', en: 'spoken' }, items: [
                { es: 'Inglés · Cambridge C1', en: 'English · Cambridge C1' },
                { es: 'Español · nativo', en: 'Spanish · native' },
            ] },
        ],
        stack: [
            { label: { es: 'lenguajes', en: 'languages' }, items: ['Python', 'TypeScript / JavaScript', 'SQL', 'Go'] },
            { label: { es: 'ia-ml', en: 'ai-ml' }, items: ['Agentes · tool calling · MCP', 'RAG', 'Evaluation harnesses', { es: 'Salida estructurada · GBNF', en: 'Structured output · GBNF' }, 'PEFT / LoRA', 'PyTorch'] },
            { label: 'local-edge', items: ['llama.cpp · GGUF', 'Ollama', { es: 'Cuantización', en: 'Quantization' }, 'whisper.cpp', 'Raspberry Pi · ESP32'] },
            { label: 'infra', items: ['Docker · K8s · Helm', 'Terraform · ArgoCD', 'AWS · GCP · Azure', 'GitHub Actions'] },
        ],
        socialLinks: [
            { label: 'LinkedIn ↗', url: 'https://www.linkedin.com/in/angelallepuz/', icon: 'linkedin' },
            { label: 'GitHub ↗',   url: 'https://github.com/allepuzz',               icon: 'github' },
        ],
        watermarkImages: ['dm1.jpg','dm2.jpg','dm3.jpg','dm4.jpg','dm5.jpg','dm6.png'],
    },
    javi: {
        name: 'Javi',
        initial: 'J',
        bio: 'El espacio está listo. La primera entrada, en camino.',
    },
    antonio: {
        name: 'Antonio',
        initial: 'A',
        bio: 'Periodista. Escribe sobre cultura, medios y el lado terapéutico del arte. Co-fundador de NousArchives.',
    },
};

const ROOT = path.join(__dirname, '..');
const posts = [];
const postsVersion = Date.now();
const assetVersion = file => require('crypto').createHash('md5')
    .update(fs.readFileSync(path.join(ROOT, file))).digest('hex').slice(0, 8);

// ── UTILITIES ─────────────────────────────────────────────────────────────────

function calcReadtime(text) {
    const words = text.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min`;
}

function extractToc(markdown) {
    const headings = [];
    const lines = markdown.split('\n');
    lines.forEach(line => {
        const m = line.match(/^(#{2,3})\s+(.+)/);
        if (m) {
            const level = m[1].length;
            const text = m[2].trim();
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            headings.push({ level, text, id });
        }
    });
    return headings;
}

function buildTocHTML(headings) {
    if (headings.length < 3) return '';
    const items = headings.map(h => {
        const indent = h.level === 3 ? ' style="padding-left:1rem;"' : '';
        return `<li${indent}><a href="#${h.id}">${h.text}</a></li>`;
    }).join('\n            ');
    return `
    <nav class="toc">
        <div class="toc-label" data-i18n="section.toc">Índice</div>
        <ol class="toc-list">
            ${items}
        </ol>
    </nav>`;
}

// Injects IDs into headings in the generated HTML so ToC links work
function injectHeadingIds(html) {
    return html.replace(/<h([23])>([^<]+)<\/h\1>/g, (match, level, text) => {
        const id = text.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        return `<h${level} id="${id}">${text}</h${level}>`;
    });
}

function relatedPostsHTML(currentPost, allPosts) {
    const related = allPosts
        .filter(p => p.url !== currentPost.url)
        .map(p => {
            const sharedTags = p.tags.filter(t => currentPost.tags.includes(t)).length;
            const sameAuthor = p.authorSlug === currentPost.authorSlug ? 1 : 0;
            return { post: p, score: sharedTags * 2 + sameAuthor };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => x.post);

    if (related.length === 0) return '';

    const items = related.map(p => {
        const typeLabel = p.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : '';
        return `
            <a href="../${p.url}" class="related-item">
                <div class="related-meta">
                    <span class="pub-author">${p.author}</span>
                    <span class="pub-type ${p.type}">${typeLabel}</span>
                </div>
                <span class="related-title">${p.title}</span>
                <span class="pub-tldr">${p.tldr}</span>
            </a>`;
    }).join('');

    return `
    <section class="related-posts">
        <div class="section-header">
            <span class="section-label" data-i18n="section.related">También en NousArchives</span>
            <div class="section-rule"></div>
        </div>
        <div class="related-grid">
            ${items}
        </div>
    </section>`;
}

// ── SHARED HTML HEAD ─────────────────────────────────────────────────────────
function htmlHead(title, depth = 1) {
    const rel = '../'.repeat(depth);
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — NousArchives</title>
    <link rel="icon" type="image/jpeg" href="${rel}logo_color.jpg">
    <link rel="stylesheet" href="${rel}style.css?v=${assetVersion('style.css')}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet">
    <script src="${rel}i18n.js?v=${assetVersion('i18n.js')}"></script>
</head>`;
}

// ── NAV BAR ───────────────────────────────────────────────────────────────────
function authorNav(depth = 1) {
    const rel = '../'.repeat(depth);
    return `    <nav class="topnav">
        <span class="nav-left" data-i18n="nav.established">EST. NOV 25</span>
        <a href="${rel}" class="nav-center" aria-label="nous Archives">
            <span class="nav-wordmark" id="nav-wordmark">
                <span class="ht-n">n</span><span class="ht-ous">ous</span><span class="ht-line" aria-hidden="true"></span><span class="ht-A">A</span><span class="ht-rchives">rchives</span>
            </span>
        </a>
        <div class="nav-links">
            <button class="lang-toggle" id="lang-toggle" onclick="window.i18n.toggle()">EN</button>
            <button class="dark-toggle" id="dark-toggle" aria-label="Modo oscuro" data-i18n-aria="nav.darkmode">◐</button>
            <a href="${rel}archivo.html" data-i18n="nav.archive">Archivo</a>
            <a href="https://youtube.com/@NousArchives" target="_blank">YouTube ↗</a>
            <a href="https://github.com/nousarchives/blog" target="_blank">GitHub ↗</a>
        </div>
    </nav>`;
}

// ── SITE FOOTER ───────────────────────────────────────────────────────────────
function authorFooter(depth = 1) {
    const rel = '../'.repeat(depth);
    return `    <footer class="footer">
        <div class="footer-bottom">
            <span><span data-i18n="footer.content">Contenido bajo</span> <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> · <span data-i18n="footer.code">Código bajo</span> <a href="${rel}LICENSE">MIT</a></span>
        </div>
    </footer>`;
}

// ── SHARED CLIENT SCRIPT ──────────────────────────────────────────────────────
const sharedScript = `
    <script>
        // Dark mode (apply before paint to avoid flash)
        (function() {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();
        document.addEventListener('DOMContentLoaded', function() {
            // Dark mode toggle button
            const btn = document.getElementById('dark-toggle');
            if (btn) {
                btn.addEventListener('click', function() {
                    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
                    localStorage.setItem('theme', isDark ? 'light' : 'dark');
                });
            }
            // Back to top button
            const backBtn = document.getElementById('back-to-top');
            if (backBtn) {
                window.addEventListener('scroll', function() {
                    backBtn.classList.toggle('visible', window.scrollY > 600);
                });
                backBtn.addEventListener('click', function() {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
            // nA scrollbar — thumb moves along X within the real viewBox (115 → 1872)
            const naThumb = document.getElementById('na-thumb-rect');
            if (naThumb) {
                const TRACK_START = 115;
                const TRACK_END = 1872;
                const TRACK_LEN = TRACK_END - TRACK_START;
                function updateNaThumb() {
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    if (maxScroll <= 0) return;
                    const ratio = window.scrollY / maxScroll;
                    const thumbW = Math.max(80, TRACK_LEN * (window.innerHeight / document.documentElement.scrollHeight));
                    const pos = TRACK_START + ratio * (TRACK_LEN - thumbW);
                    naThumb.setAttribute('x', pos.toFixed(1));
                    naThumb.setAttribute('width', thumbW.toFixed(1));
                }
                window.addEventListener('scroll', updateNaThumb, { passive: true });
                window.addEventListener('resize', updateNaThumb);
                updateNaThumb();
            }
            // Navbar animation: nousArchives ↔ n_A
            const navWordmark = document.getElementById('nav-wordmark');
            if (navWordmark) {
                const THRESHOLD = 80;
                let isCollapsed = false;
                function updateWordmark() {
                    const shouldCollapse = window.scrollY > THRESHOLD;
                    if (shouldCollapse !== isCollapsed) {
                        isCollapsed = shouldCollapse;
                        navWordmark.classList.toggle('collapsed', isCollapsed);
                    }
                }
                window.addEventListener('scroll', updateWordmark, { passive: true });
                updateWordmark();
            }
        });
    </script>`;

const naScrollbar = `
    <div class="na-scrollbar" aria-hidden="true">
        <svg id="na-svg"
             viewBox="115 470 1757 188"
             preserveAspectRatio="xMidYMid meet"
             xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0,1080) scale(0.1,-0.1)" fill="currentColor" opacity="0.5">
                <path d="M18272 5803 c-11 -27 -295 -844 -304 -872 -4 -12 -97 -14 -639 -13 -349 1 -4061 9 -8249 18 -4188 8 -7638 17 -7667 20 l-52 5 -3 247 c-3 230 -4 250 -25 287 -44 84 -104 115 -216 115 -87 0 -131 -16 -186 -66 l-39 -35 -14 43 -15 43 -71 3 -72 3 2 -347 3 -346 90 -2 90 -1 5 225 c6 261 12 285 84 320 50 24 66 25 111 6 57 -24 60 -37 65 -306 l5 -245 945 -2 c520 -1 3798 -9 7285 -18 7118 -17 8644 -19 8652 -11 3 3 24 61 48 128 l41 123 210 0 209 0 41 -125 41 -125 61 -3 60 -3 -45 128 c-25 70 -67 191 -94 268 -27 77 -82 235 -122 350 l-74 210 -75 3 c-74 3 -75 2 -86 -25z m173 -325 c43 -128 80 -239 83 -245 3 -10 -36 -13 -173 -13 -137 0 -176 3 -173 13 3 6 40 117 83 245 43 127 83 232 90 232 6 0 47 -105 90 -232z"/>
            </g>
            <rect id="na-thumb-rect" x="115" y="648" width="300" height="8" rx="4" fill="currentColor" opacity="0.7"/>
        </svg>
    </div>`;

const backToTopBtn = `    <button class="back-to-top" id="back-to-top" aria-label="Volver arriba" data-i18n-aria="backtotop">↑</button>`;

// ── ARTICLE TEMPLATE ─────────────────────────────────────────────────────────
function articleTemplate(fm, htmlContent, authorSlug, tocHTML, relatedHTML) {
    const author = AUTHORS[authorSlug];
    const tagsHTML = (fm.tags || []).map(t => `<span class="pub-tag">${t}</span>`).join('');
    const typeLabel = fm.type ? fm.type.charAt(0).toUpperCase() + fm.type.slice(1) : '';

    const angelWatermark = authorSlug === 'angel' ? `
    <div class="angel-watermark"><img id="angel-watermark-img" src="" alt=""></div>` : '';
    const angelWatermarkScript = authorSlug === 'angel' ? `
            const watermarkImg = document.getElementById('angel-watermark-img');
            if (watermarkImg) {
                const imgs = ['dm1.jpg','dm2.jpg','dm3.jpg','dm4.jpg','dm5.jpg','dm6.png'];
                watermarkImg.src = '../angel/' + imgs[Math.floor(Math.random() * imgs.length)];
            }` : '';

    return `${htmlHead(fm.title, 1)}
<body class="article-page${authorSlug === 'angel' ? ' angel-page' : ''}">
    <div class="progress-bar" id="progress-bar"></div>
${angelWatermark}
${authorNav(1)}
    <article>
        <header class="article-header">
            <div class="article-meta-top">
                <span><a href="../${authorSlug}/" style="color:inherit;text-decoration:none;">${author ? author.name : authorSlug}</a></span>
                <span>·</span>
                ${fm.type ? `<span class="pub-type ${fm.type}">${typeLabel}</span>` : ''}
                <span>·</span>
                <span>${fm.readtime}</span>
                <span>·</span>
                <span>${fm.wordcount} <span data-i18n="article.words">palabras</span></span>
            </div>
            <h1 class="article-title">${fm.title}</h1>
            ${fm.tldr ? `<p class="article-subtitle">${fm.tldr}</p>` : ''}
            <div class="article-byline">
                <span>${fm.date || ''}</span>
            </div>
            ${tagsHTML ? `<div class="article-tags">${tagsHTML}</div>` : ''}
        </header>
        ${tocHTML}
        <div class="article-body">
            ${htmlContent}
        </div>
    </article>
    ${relatedHTML}
${authorFooter(1)}
${backToTopBtn}
${naScrollbar}
    <script>
        // Barra de progreso de lectura
        window.addEventListener('scroll', function() {
            const article = document.querySelector('.article-body');
            if (!article) return;
            const bar = document.getElementById('progress-bar');
            const start = article.offsetTop;
            const end = article.offsetTop + article.offsetHeight - window.innerHeight;
            const progress = Math.min(100, Math.max(0, ((window.scrollY - start) / (end - start)) * 100));
            bar.style.width = progress + '%';
        });
        document.addEventListener('DOMContentLoaded', function() {${angelWatermarkScript}
        });
    </script>
${sharedScript}
</body>
</html>`;
}

// ── SOCIAL ICONS — outline line icons from Lucide v0.400.0 (ISC license) ──────
const socialIcon = inner => `<svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const SOCIAL_ICONS = {
    github: socialIcon('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'),
    linkedin: socialIcon('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>'),
};

// ── AUTHOR PAGE TEMPLATE ─────────────────────────────────────────────────────
function authorPageTemplate(slug) {
    const author = AUTHORS[slug];

    // Social links en el hero
    const socialLinksHTML = author.socialLinks
        ? author.socialLinks.map(l => `<a href="${l.url}" target="_blank" class="author-social">${l.icon ? SOCIAL_ICONS[l.icon] : ''}${l.label}</a>`).join('')
        : '';

    // Open topics (solo si el autor los tiene configurados)
    const openTopicsSection = author.openTopics ? `
    <section class="open-topics-section">
        <div class="section-header">
            <span class="section-label" data-i18n="section.opentopics">Current Open Topics</span>
            <div class="section-rule"></div>
        </div>
        <div class="open-topics-grid">
            ${Object.entries(author.openTopics).map(([category, items]) => `
            <div class="open-topic-group">
                <h3 class="open-topic-category">${category}</h3>
                <ul class="open-topic-list">
                    ${items.map(item => `<li>${item}</li>`).join('\n                    ')}
                </ul>
            </div>`).join('')}
        </div>
    </section>` : '';

    // Bilingual strings: { es, en } → two spans toggled by html[lang] in style.css
    const l10n = v => typeof v === 'string' ? v
        : `<span data-l="es">${v.es}</span><span data-l="en">${v.en}</span>`;

    // Terminal hero (only if configured) — replaces the classic initial + bio hero
    const th = author.terminalHero;
    const heroHTML = th ? `
    <section class="term-hero" id="term-hero">
        <h1 class="sr-only">${th.fullName}</h1>
        <p class="sr-only">${th.nameTagline}</p>
        <p class="sr-only">${th.thesisArt.join(' ')}. ${th.thesisText.join(' ')}</p>
        <div class="term-stage" aria-hidden="true"><canvas id="term-canvas"></canvas></div>
    </section>
    <div class="term-links">${socialLinksHTML}</div>
    <script>window.TERM_HERO = ${JSON.stringify(th)};</script>
    <script src="../term-hero.js?v=${assetVersion('term-hero.js')}"></script>` : `
    <header class="author-hero">
        <div class="author-hero-initial">${author.initial}</div>
        <div class="author-hero-right">
            <h1 class="author-hero-name">${author.name}</h1>
            <p class="author-hero-bio">${l10n(author.bio)}</p>
            <div class="author-hero-meta"><span id="post-count">0 entradas</span>${socialLinksHTML}</div>
        </div>
    </header>`;

    // Section header: classic label + rule, or a box-letter canvas title on terminal pages
    const sectionHeader = (key, es, en) => th ? `
        <div class="term-title" data-es="${es}" data-en="${en}">
            <h2 class="sr-only">${l10n({ es, en })}</h2>
            <canvas aria-hidden="true"></canvas>
        </div>` : `
        <div class="section-header">
            <span class="section-label" data-i18n="${key}">${es}</span>
            <div class="section-rule"></div>
        </div>`;

    // Projects (only if the author has them configured)
    const projectsSection = author.projects ? `
    <section class="projects-section">${sectionHeader('section.projects', 'Proyectos', 'Projects')}
        <div class="term-panels">
            ${author.projects.map((p, i) => `
            <a href="${p.url}" target="_blank" class="term-panel">
                <span class="term-panel-title">${String(i + 1).padStart(2, '0')} · ${p.title}</span>
                <span class="term-panel-badge">[${p.kind}]</span>
                <span class="term-panel-meta"># ${p.claim ? l10n(p.claim) + ' · ' : ''}${p.year}</span>
                <p class="term-panel-desc">${l10n(p.desc)}</p>
                <p class="term-panel-fact">${l10n(p.fact)}</p>
                <div class="term-panel-tags">${p.stack.map(t => `<span>[${t.toLowerCase()}]</span>`).join('')}</div>
                <span class="term-panel-foot">${p.url.replace('https://', '')} ↗</span>
            </a>`).join('')}
        </div>
    </section>` : '';

    // Stack (only if the author has it configured)
    // `tree`-style columns: [{ label, items }]
    const treeColumns = (groups, extraClass = '') => `
        <div class="stack-tree${extraClass}">
            ${groups.map(({ label, items }) => `
            <div class="tree">
                <h3 class="tree-root">${l10n(label)}/</h3>
                <ul>
                    ${items.map(item => `<li>${l10n(item)}</li>`).join('\n                    ')}
                </ul>
            </div>`).join('')}
        </div>`;

    const stackSection = author.stack ? `
    <section class="open-topics-section">${sectionHeader('section.stack', 'Stack', 'Stack')}${treeColumns(author.stack)}
    </section>` : '';

    // Certifications + spoken languages (only if configured)
    const certsSection = author.certs ? `
    <section class="open-topics-section">${sectionHeader('section.certs', 'Certificaciones', 'Certifications')}${treeColumns(author.certs, ' stack-tree-left')}
    </section>` : '';

    return `${htmlHead(author.name, 1)}
<body${author.bodyClass ? ` class="${author.bodyClass}"` : ''}>
${authorNav(1)}
${heroHTML}
${stackSection}
${certsSection}
${projectsSection}
${openTopicsSection}
    <section class="author-posts-section">${sectionHeader('section.allposts', 'Entradas', 'All posts')}
        <div id="author-pub-list"></div>
    </section>

${authorFooter(1)}
${backToTopBtn}
${naScrollbar}
    <script src="../posts.js?v=${postsVersion}"></script>
    <script>
        const CURRENT_AUTHOR_SLUG = "${slug}";
        const PANEL_POSTS = ${!!th};
        function renderAuthorPage() {
            const pubList = document.getElementById('author-pub-list');
            const countLabel = document.getElementById('post-count');
            const myPosts = POSTS.filter(p => p.authorSlug === CURRENT_AUTHOR_SLUG);
            if (countLabel) {
                const word = myPosts.length === 1 ? window.i18n.t('author.entries.one') : window.i18n.t('author.entries.other');
                countLabel.textContent = myPosts.length + ' ' + word;
            }
            if (myPosts.length === 0) {
                const emptyLines = window.i18n.t('empty.author').split('\\n');
                pubList.innerHTML = '<div class="pub-empty"><span class="pub-empty-glyph">∅</span><p>' + emptyLines.join('<br>') + '</p></div>';
                return;
            }
            const listContainer = document.createElement('div');
            listContainer.className = PANEL_POSTS ? 'term-panels' : 'pub-list';
            myPosts.forEach(post => {
                if (PANEL_POSTS) {
                    const file = post.url.split('/').pop();
                    listContainer.innerHTML += \`
                    <a href="\${file}" class="term-panel">
                        <span class="term-panel-title">\${post.title}</span>
                        <span class="term-panel-badge">[\${post.type || ''}]</span>
                        <span class="term-panel-meta"># \${post.date} · \${post.readtime}</span>
                        \${post.tldr ? '<p class="term-panel-desc">' + post.tldr + '</p>' : ''}
                        <div class="term-panel-tags">\${post.tags.map(t => '<span>[' + t + ']</span>').join('')}</div>
                        <span class="term-panel-foot">\${file} ↗</span>
                    </a>\`;
                    return;
                }
                const tagsHTML = post.tags.map(t => '<span class="pub-tag">' + t + '</span>').join('');
                const postUrl = post.url.split('/').pop();
                const typeLabel = post.type ? post.type.charAt(0).toUpperCase() + post.type.slice(1) : '';
                listContainer.innerHTML += \`
                    <a href="\${postUrl}" class="pub-item">
                        <div class="pub-left">
                            <span class="pub-author">\${post.author}</span>
                            <span class="pub-date">\${post.date}</span>
                        </div>
                        <div class="pub-center">
                            <span class="pub-title">\${post.title}</span>
                            <span class="pub-tldr">\${post.tldr}</span>
                            <div class="pub-tags">\${tagsHTML}</div>
                        </div>
                        <div class="pub-right">
                            <span class="pub-type \${post.type}">\${typeLabel}</span>
                            <span class="pub-readtime">\${post.readtime}</span>
                        </div>
                    </a>\`;
            });
            pubList.appendChild(listContainer);
        }
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof POSTS !== 'undefined') renderAuthorPage();
        });
    </script>
${sharedScript}
</body>
</html>`;
}

// ── /archivo PAGE ────────────────────────────────────────────────────────────
function archivoPageTemplate() {
    return `${htmlHead('Archivo', 0)}
<body>
    <nav class="topnav">
        <a href="./" class="nav-left" data-i18n="nav.back">← NousArchives</a>
        <a href="./" class="nav-center" aria-label="nous Archives">
            <span class="nav-wordmark" id="nav-wordmark">
                <span class="ht-n">n</span><span class="ht-ous">ous</span><span class="ht-line" aria-hidden="true"></span><span class="ht-A">A</span><span class="ht-rchives">rchives</span>
            </span>
        </a>
        <div class="nav-links">
            <button class="lang-toggle" id="lang-toggle" onclick="window.i18n.toggle()">EN</button>
            <button class="dark-toggle" id="dark-toggle" aria-label="Modo oscuro" data-i18n-aria="nav.darkmode">◐</button>
            <a href="https://youtube.com/@NousArchives" target="_blank">YouTube ↗</a>
        </div>
    </nav>

    <header class="hero" style="padding-bottom:0;">
        <h1 class="hero-title" style="font-size:clamp(2.5rem,7vw,5rem);" data-i18n="archive.title">Archivo</h1>
        <div class="hero-meta" style="padding-bottom:3rem;" data-i18n="archive.subtitle">Todas las entradas por orden cronológico</div>
    </header>

    <main class="content" style="padding-bottom:5rem;">
        <div id="archivo-list"></div>
    </main>

    <footer class="footer">
        <div class="footer-bottom">
            <span><span data-i18n="footer.content">Contenido bajo</span> <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> · <span data-i18n="footer.code">Código bajo</span> <a href="LICENSE">MIT</a></span>
        </div>
    </footer>
${backToTopBtn}
${naScrollbar}
    <script src="posts.js?v=${postsVersion}"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof POSTS === 'undefined') return;
            const container = document.getElementById('archivo-list');

            // Group by year-month
            const groups = {};
            POSTS.forEach(post => {
                const d = new Date(post.date);
                const noDate = window.i18n.t('archive.nodate');
                const key = isNaN(d) ? 'nodate' : d.getFullYear() + '-' + String(d.getMonth()).padStart(2,'0');
                const label = isNaN(d) ? noDate : d.toLocaleDateString(window.i18n.lang() === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' });
                if (!groups[key]) groups[key] = { label, posts: [] };
                groups[key].posts.push(post);
            });

            const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
            sortedKeys.forEach(key => {
                const g = groups[key];
                const section = document.createElement('div');
                section.innerHTML = \`
                    <div class="section-header">
                        <span class="section-label">\${g.label}</span>
                        <div class="section-rule"></div>
                    </div>\`;
                const list = document.createElement('div');
                list.className = 'pub-list';
                g.posts.forEach(post => {
                    const tagsHTML = post.tags.map(t => '<span class="pub-tag">' + t + '</span>').join('');
                    const typeLabel = post.type ? post.type.charAt(0).toUpperCase() + post.type.slice(1) : '';
                    list.innerHTML += \`
                        <a href="\${post.url}" class="pub-item">
                            <div class="pub-left">
                                <span class="pub-author">\${post.author}</span>
                                <span class="pub-date">\${post.date}</span>
                            </div>
                            <div class="pub-center">
                                <span class="pub-title">\${post.title}</span>
                                <span class="pub-tldr">\${post.tldr}</span>
                                <div class="pub-tags">\${tagsHTML}</div>
                            </div>
                            <div class="pub-right">
                                <span class="pub-type \${post.type}">\${typeLabel}</span>
                                <span class="pub-readtime">\${post.readtime}</span>
                            </div>
                        </a>\`;
                });
                section.appendChild(list);
                container.appendChild(section);
            });
        });
    </script>
${sharedScript}
</body>
</html>`;
}

// ── AUTHOR PROCESSING ────────────────────────────────────────────────────────
Object.keys(AUTHORS).forEach(slug => {
    const authorDir = path.join(ROOT, slug);
    if (!fs.existsSync(authorDir)) {
        fs.mkdirSync(authorDir);
        console.log(`📁 Created directory: ${slug}/`);
    }

    fs.writeFileSync(path.join(authorDir, 'index.html'), authorPageTemplate(slug));

    const files = fs.readdirSync(authorDir);

    files.forEach(file => {
        if (!file.endsWith('.md')) return;

        const filePath = path.join(authorDir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');

        let fm, body;
        try {
            const parsed = matter(raw);
            fm = parsed.data;
            body = parsed.content;
        } catch (e) {
            console.warn(`⚠️  Invalid frontmatter in ${slug}/${file}: ${e.message}`);
            return;
        }

        if (!fm.title) {
            console.warn(`⚠️  No title in ${slug}/${file}, skipping.`);
            return;
        }

        if (!Array.isArray(fm.tags)) {
            fm.tags = fm.tags ? String(fm.tags).replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean) : [];
        }

        if (!fm.author) fm.author = AUTHORS[slug]?.name || slug;
        fm.authorSlug = slug;

        // Readtime and wordcount auto-calculated (author can override in frontmatter)
        const wordcount = body.trim().split(/\s+/).length;
        fm.wordcount = wordcount;
        if (!fm.readtime) fm.readtime = calcReadtime(body);

        // gray-matter parses YYYY-MM-DD into a Date; keep it as the plain string everywhere
        if (fm.date instanceof Date) fm.date = fm.date.toISOString().slice(0, 10);

        posts.push({
            title:      fm.title,
            tldr:       fm.tldr || '',
            date:       fm.date ? String(fm.date) : '',
            type:       fm.type || 'articulo',
            tags:       fm.tags,
            readtime:   fm.readtime,
            wordcount:  fm.wordcount,
            author:     fm.author,
            authorSlug: slug,
            url:        `${slug}/${file.replace('.md', '.html')}`,
        });

        console.log(`✅ ${slug}/${file} → ${file.replace('.md', '.html')} (${fm.wordcount} words, ${fm.readtime})`);
    });

    // Limpieza: borrar .html sin .md correspondiente
    fs.readdirSync(authorDir).forEach(file => {
        if (!file.endsWith('.html') || file === 'index.html') return;
        const mdPath = path.join(authorDir, file.replace('.html', '.md'));
        if (!fs.existsSync(mdPath)) {
            fs.unlinkSync(path.join(authorDir, file));
            console.log(`🗑️  Deleted: ${slug}/${file} (no matching .md)`);
        }
    });
});

// ── SORT AND GENERATE ARTICLE HTML (needs all posts loaded first for related posts) ──
posts.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    if (isNaN(da)) return 1;
    if (isNaN(db)) return -1;
    return db - da;
});

posts.forEach(postMeta => {
    const [slug, filename] = postMeta.url.split('/');
    const mdFile = filename.replace('.html', '.md');
    const filePath = path.join(ROOT, slug, mdFile);
    if (!fs.existsSync(filePath)) return;

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: fm, content: body } = matter(raw);

    if (!Array.isArray(fm.tags)) {
        fm.tags = fm.tags ? String(fm.tags).replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean) : [];
    }
    fm.readtime = postMeta.readtime;
    fm.wordcount = postMeta.wordcount;

    const headings = extractToc(body);
    const tocHTML = buildTocHTML(headings);
    const htmlContent = injectHeadingIds(marked.parse(body));
    const relatedHTML = relatedPostsHTML(postMeta, posts);

    const outputPath = path.join(ROOT, slug, filename);
    fs.writeFileSync(outputPath, articleTemplate(fm, htmlContent, slug, tocHTML, relatedHTML));
});

// ── WRITE posts.js ────────────────────────────────────────────────────────────
fs.writeFileSync(
    path.join(ROOT, 'posts.js'),
    `const POSTS = ${JSON.stringify(posts, null, 2)};\n`
);

// ── GENERATE /archivo ─────────────────────────────────────────────────────────
fs.writeFileSync(path.join(ROOT, 'archivo.html'), archivoPageTemplate());

console.log(`\n📦 posts.js updated with ${posts.length} post(s).`);
console.log(`📅 archivo.html generated.`);
