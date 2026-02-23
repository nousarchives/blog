const fs = require('fs');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

marked.setOptions({ headerIds: false, mangle: false });

const AUTHORS = {
    angel:   { name: 'Ángel',   initial: 'Á', bio: 'Ingeniero de telecomunicaciones reconvertido en consultor de arquitecturas API.' },
    javi:    { name: 'Javi',    initial: 'J', bio: 'El espacio está listo. La primera entrada, en camino.' },
    antonio: { name: 'Antonio', initial: 'A', bio: 'Periodista. Escribe sobre cultura, medios y el lado terapéutico del arte. Co-fundador de NousArchives.' },
};

const ROOT = path.join(__dirname, '..');
const posts = [];

// ── CABECERA HTML COMÚN ──────────────────────────────────────────────────────
function htmlHead(title, depth = 1) {
    const rel = '../'.repeat(depth);
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — NousArchives</title>
    <link rel="icon" type="image/jpeg" href="${rel}logo_color.jpg">
    <link rel="stylesheet" href="${rel}style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
</head>`;
}

// ── NAV Y FOOTER PARA PÁGINAS DE AUTOR / ARTÍCULO ───────────────────────────
function authorNav(depth = 1) {
    const rel = '../'.repeat(depth);
    return `    <nav class="topnav">
        <a href="${rel}" class="nav-left">← NousArchives</a>
        <a href="${rel}" class="nav-center"><img src="${rel}logo.png" alt="NousArchives" class="nav-logo"></a>
        <div class="nav-links">
            <a href="https://youtube.com/@NousArchives" target="_blank">YouTube ↗</a>
        </div>
    </nav>`;
}

function authorFooter(depth = 1) {
    const rel = '../'.repeat(depth);
    return `    <footer class="footer">
        <div class="footer-top">
            <a href="${rel}" class="footer-logo">NousArchives</a>
            <nav class="footer-nav">
                <a href="https://youtube.com/@NousArchives" target="_blank">YouTube ↗</a>
            </nav>
        </div>
        <div class="footer-bottom">
            <span>© 2026 NousArchives</span>
            <span>Contenido bajo <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> · Código bajo <a href="${rel}LICENSE">MIT</a></span>
        </div>
    </footer>`;
}

// ── TEMPLATE ARTÍCULO ────────────────────────────────────────────────────────
function articleTemplate(fm, htmlContent, authorSlug) {
    const author = AUTHORS[authorSlug];
    const tagsHTML = (fm.tags || []).map(t => `<span class="pub-tag">${t}</span>`).join('');
    const typeLabel = fm.type ? fm.type.charAt(0).toUpperCase() + fm.type.slice(1) : '';

    return `${htmlHead(fm.title, 1)}
<body class="article-page">
${authorNav(1)}
    <article>
        <header class="article-header">
            <div class="article-meta-top">
                <span><a href="../${authorSlug}/" style="color:inherit;text-decoration:none;">${author ? author.name : authorSlug}</a></span>
                <span>·</span>
                <span>${fm.type ? `<span class="pub-type ${fm.type}">${typeLabel}</span>` : ''}</span>
                <span>·</span>
                <span>${fm.readtime || ''}</span>
            </div>
            <h1 class="article-title">${fm.title}</h1>
            ${fm.tldr ? `<p class="article-subtitle">${fm.tldr}</p>` : ''}
            <div class="article-byline">
                <span>${fm.date || ''}</span>
            </div>
            ${tagsHTML ? `<div class="article-tags">${tagsHTML}</div>` : ''}
        </header>
        <div class="article-body">
            ${htmlContent}
        </div>
    </article>
${authorFooter(1)}
</body>
</html>`;
}

// ── TEMPLATE PÁGINA DE AUTOR ─────────────────────────────────────────────────
function authorPageTemplate(slug) {
    const author = AUTHORS[slug];
    return `${htmlHead(author.name, 1)}
<body>
${authorNav(1)}
    <header class="author-hero">
        <div class="author-hero-initial">${author.initial}</div>
        <div class="author-hero-right">
            <h1 class="author-hero-name">${author.name}</h1>
            <p class="author-hero-bio">${author.bio}</p>
            <div class="author-hero-meta">
                <span id="post-count">0 entradas</span>
            </div>
        </div>
    </header>

    <section class="author-posts-section">
        <div class="section-header">
            <span class="section-label">Todas las entradas</span>
            <div class="section-rule"></div>
        </div>
        <div id="author-pub-list"></div>
    </section>

${authorFooter(1)}

    <script src="../posts.js"></script>
    <script>
        const CURRENT_AUTHOR_SLUG = "${slug}";
        function renderAuthorPage() {
            const pubList = document.getElementById('author-pub-list');
            const countLabel = document.getElementById('post-count');
            const myPosts = POSTS.filter(p => p.authorSlug === CURRENT_AUTHOR_SLUG);
            if (countLabel) {
                countLabel.textContent = myPosts.length + ' ' + (myPosts.length === 1 ? 'entrada' : 'entradas');
            }
            if (myPosts.length === 0) {
                pubList.innerHTML = '<div class="pub-empty"><span class="pub-empty-glyph">∅</span><p>Todavía no hay nada por aquí.<br>Pero el silencio también dice algo.</p></div>';
                return;
            }
            const listContainer = document.createElement('div');
            listContainer.className = 'pub-list';
            myPosts.forEach(post => {
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
</body>
</html>`;
}

// ── PROCESADO DE AUTORES ─────────────────────────────────────────────────────
Object.keys(AUTHORS).forEach(slug => {
    const authorDir = path.join(ROOT, slug);
    if (!fs.existsSync(authorDir)) {
        fs.mkdirSync(authorDir);
        console.log(`📁 Creado directorio: ${slug}/`);
    }

    // Regenerar siempre el index.html del autor desde el template
    const authorIndexPath = path.join(authorDir, 'index.html');
    fs.writeFileSync(authorIndexPath, authorPageTemplate(slug));

    const files = fs.readdirSync(authorDir);

    // 1. Procesar .md → .html
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
            console.warn(`⚠️  Frontmatter inválido en ${slug}/${file}: ${e.message}`);
            return;
        }

        if (!fm.title) {
            console.warn(`⚠️  Sin título en ${slug}/${file}, saltando.`);
            return;
        }

        // Normalizar tags
        if (!Array.isArray(fm.tags)) {
            fm.tags = fm.tags ? String(fm.tags).replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean) : [];
        }

        // Rellenar autor desde AUTHORS si no viene en el frontmatter
        if (!fm.author) fm.author = AUTHORS[slug]?.name || slug;
        fm.authorSlug = slug;

        const htmlContent = marked.parse(body);
        const outputFile = file.replace('.md', '.html');
        const outputPath = path.join(authorDir, outputFile);

        fs.writeFileSync(outputPath, articleTemplate(fm, htmlContent, slug));

        posts.push({
            title:      fm.title,
            tldr:       fm.tldr || '',
            date:       fm.date ? (fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date)) : '',
            type:       fm.type || 'articulo',
            tags:       fm.tags,
            readtime:   fm.readtime || '',
            author:     fm.author,
            authorSlug: slug,
            url:        `${slug}/${outputFile}`,
        });

        console.log(`✅ ${slug}/${file} → ${outputFile}`);
    });

    // 2. Limpieza: borrar .html sin .md correspondiente
    fs.readdirSync(authorDir).forEach(file => {
        if (!file.endsWith('.html') || file === 'index.html') return;
        const mdPath = path.join(authorDir, file.replace('.html', '.md'));
        if (!fs.existsSync(mdPath)) {
            fs.unlinkSync(path.join(authorDir, file));
            console.log(`🗑️  Eliminado: ${slug}/${file} (su .md no existe)`);
        }
    });
});

// ── ORDENAR POR FECHA DESCENDENTE ────────────────────────────────────────────
posts.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    if (isNaN(da)) return 1;
    if (isNaN(db)) return -1;
    return db - da;
});

// ── GUARDAR posts.js EN LA RAÍZ ──────────────────────────────────────────────
const postsJsPath = path.join(ROOT, 'posts.js');
fs.writeFileSync(postsJsPath, `const POSTS = ${JSON.stringify(posts, null, 2)};\n`);

console.log(`\n📦 posts.js actualizado con ${posts.length} entrada(s).`);
