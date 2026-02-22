
// scripts/build.js
// Convierte archivos .md de autores en páginas HTML
// y regenera posts.js automáticamente.

const fs   = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

// ── Configuración ─────────────────────────────

const ROOT = path.join(__dirname, "..");

const AUTHOR_SLUGS = ["angel", "javi", "antonio", "invitados"];

const AUTHORS = {
    angel:    { name: "Ángel",   initial: "Á" },
    javi:     { name: "Javi",    initial: "J" },
    antonio:  { name: "Antonio", initial: "A" },
};

// Tipos permitidos y sus etiquetas
const TYPE_LABELS = {
    articulo:   "Artículo",
    comentario: "Comentario",
    respuesta:  "Respuesta",
    ensayo:     "Ensayo",
};

// ── Utilidades ────────────────────────────────

function readFile(filePath) {
    return fs.readFileSync(filePath, "utf-8");
}

function writeFile(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
}

function slugify(str) {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

// ── Plantilla HTML para artículos ─────────────

function articleHTML({ authorSlug, authorName, date, title, subtitle, type, tags, readtime, contentHTML, sourceFile }) {
    const typeLabel = TYPE_LABELS[type] || type;
    const tagsHTML = tags.length
        ? tags.map(t => `<span class="pub-tag">${t}</span>`).join("\n            ")
        : "";
    const pathToRoot = authorSlug === "invitados" ? "../../" : "../";

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — NousArchives</title>
    <link rel="stylesheet" href="${pathToRoot}style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body>

    <nav class="topnav">
        <a href="${pathToRoot}" class="nav-left">← NousArchives</a>
        <span class="nav-center">${authorName}</span>
        <div class="nav-links">
            <a href="${pathToRoot}angel/">Ángel</a>
            <a href="${pathToRoot}javi/">Javi</a>
            <a href="${pathToRoot}antonio/">Antonio</a>
        </div>
    </nav>

    <header class="article-header">
        <div class="article-meta-top">
            <span>${authorName}</span>
            <span class="dot">·</span>
            <span>${date}</span>
            <span class="dot">·</span>
            <span>${typeLabel}</span>
        </div>

        <h1 class="article-title">${title}</h1>
        ${subtitle ? `<p class="article-subtitle">${subtitle}</p>` : ""}

        <div class="article-byline">
            <span>${readtime} de lectura</span>
        </div>

        ${tagsHTML ? `<div class="article-tags">\n            ${tagsHTML}\n        </div>` : ""}
    </header>

    <div class="article-body">
${contentHTML}
    </div>

    <footer class="footer">
        <div class="footer-top">
            <a href="${pathToRoot}" class="footer-logo">NousArchives</a>
            <nav class="footer-nav">
                <a href="${pathToRoot}angel/">Ángel</a>
                <a href="${pathToRoot}javi/">Javi</a>
                <a href="${pathToRoot}antonio/">Antonio</a>
            </nav>
        </div>
        <div class="footer-bottom">
            <span>© 2026 NousArchives — Murcia</span>
            <span>CC BY-NC-SA 4.0</span>
        </div>
    </footer>

</body>
</html>`;
}

// ── Procesar un archivo .md ───────────────────

function processMarkdown(mdPath) {
    const raw = readFile(mdPath);
    const { data: frontmatter, content } = matter(raw);

    // Validar campos mínimos
    const required = ["title", "date", "type"];
    const missing = required.filter(k => !frontmatter[k]);
    if (missing.length) {
        console.warn(`  ⚠ ${mdPath} — faltan campos: ${missing.join(", ")}. Saltando.`);
        return null;
    }

    const authorSlug = mdPath.split(path.sep).slice(-2)[0]; // carpeta padre
    const authorName = AUTHORS[authorSlug]?.name || authorSlug;
    const mdFilename = path.basename(mdPath, ".md");
    const htmlFilename = mdFilename + ".html";
    const htmlPath = path.join(path.dirname(mdPath), htmlFilename);

    // Normalizar campos
    const tags = Array.isArray(frontmatter.tags)
        ? frontmatter.tags.map(t => String(t).toLowerCase().trim())
        : [];

    const dateRaw = frontmatter.date;
    const dateObj  = dateRaw instanceof Date ? dateRaw : new Date(dateRaw);
    const dateISO  = dateObj.toISOString().split("T")[0];
    const dateDisplay = dateObj.toLocaleDateString("es-ES", { month: "short", year: "numeric" });

    // Convertir markdown a HTML (con clases de artículo aplicadas)
    const contentHTML = marked.parse(content.trim());

    // Generar HTML del artículo
    const html = articleHTML({
        authorSlug,
        authorName,
        date: dateDisplay,
        title: frontmatter.title,
        subtitle: frontmatter.tldr || frontmatter.subtitle || "",
        type: frontmatter.type,
        tags,
        readtime: frontmatter.readtime || "5 min",
        contentHTML,
        sourceFile: path.basename(mdPath),
    });

    writeFile(htmlPath, html);

    // Devolver datos para posts.js
    return {
        id: `${authorSlug}-${slugify(frontmatter.title)}`,
        author: authorName,
        authorSlug,
        date: dateDisplay,
        dateISO,
        title: frontmatter.title,
        tldr: frontmatter.tldr || frontmatter.subtitle || "",
        url: `${authorSlug}/${htmlFilename}`,
        type: frontmatter.type,
        tags,
        readtime: frontmatter.readtime || "5 min",
    };
}

// ── Regenerar posts.js ────────────────────────

function generatePostsJS(posts) {
    const authorsSection = Object.entries(AUTHORS)
        .map(([slug, a]) => `    ${slug}: {
        name: "${a.name}",
        initial: "${a.initial}",
        bio: "",      // ← editar en posts.js directamente
        location: "Murcia"
    }`)
        .join(",\n");

    const postsJSON = posts
        .map(p => {
            const tagsStr = p.tags.length
                ? `[${p.tags.map(t => `"${t}"`).join(", ")}]`
                : "[]";
            return `    {
        id: "${p.id}",
        author: "${p.author}",
        authorSlug: "${p.authorSlug}",
        date: "${p.date}",
        dateISO: "${p.dateISO}",
        title: ${JSON.stringify(p.title)},
        tldr: ${JSON.stringify(p.tldr)},
        url: "${p.url}",
        type: "${p.type}",
        tags: ${tagsStr},
        readtime: "${p.readtime}"
    }`;
        })
        .join(",\n\n");

    return `// posts.js — generado automáticamente por scripts/build.js
// NO editar manualmente. Escribe en los .md de cada autor.
// Para cambiar bios, edita AUTHORS en scripts/build.js

const POSTS = [
${postsJSON}

    // ── PLANTILLA ───────────────────────────────────────────────
    // Crea un archivo .md en tu carpeta con este formato:
    //
    // ---
    // title: Título de tu entrada
    // tldr: Una o dos frases que resuman de qué va.
    // date: 2026-02-22
    // type: articulo       # articulo | comentario | respuesta | ensayo
    // tags: [cine, ia]     # ia | cine | literatura | musica | ml | derecho
    // readtime: 8 min
    // ---
    //
    // El contenido del artículo en Markdown debajo del ---
    // ────────────────────────────────────────────────────────────
];

const AUTHORS = {
${authorsSection}
};
`;
}

// ── Main ──────────────────────────────────────

function main() {
    console.log("\n🔨 NousArchives build\n");

    const allPosts = [];

    // Recoger todos los .md de carpetas de autores
    for (const slug of AUTHOR_SLUGS) {
        const dir = path.join(ROOT, slug);
        if (!fs.existsSync(dir)) continue;

        const mdFiles = fs.readdirSync(dir).filter(f => f.endsWith(".md") && f !== "README.md");
        if (mdFiles.length) {
            console.log(`📂 ${slug}/`);
        }

        for (const file of mdFiles) {
            const fullPath = path.join(dir, file);
            const post = processMarkdown(fullPath);
            if (post) allPosts.push(post);
        }
    }

    // Ordenar por fecha descendente
    allPosts.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));

    // Leer posts.js existente para preservar las bios
    const postsJSPath = path.join(ROOT, "posts.js");
    let existingBios = {};
    if (fs.existsSync(postsJSPath)) {
        try {
            const existing = readFile(postsJSPath);
            // Extraer bios con regex simple
            const bioMatches = existing.matchAll(/(\w+):\s*\{[^}]*bio:\s*"([^"]*)"/g);
            for (const m of bioMatches) {
                existingBios[m[1]] = m[2];
            }
        } catch (e) { /* no pasa nada */ }
    }

    // Regenerar posts.js (preservar bios si existen)
    let postsJS = generatePostsJS(allPosts);
    for (const [slug, bio] of Object.entries(existingBios)) {
        if (bio) {
            postsJS = postsJS.replace(
                new RegExp(`(${slug}:[^}]*bio:\\s*)""`),
                `$1"${bio}"`
            );
        }
    }

    writeFile(postsJSPath, postsJS);

    console.log(`\n✅ ${allPosts.length} entradas procesadas\n`);
}

main();
