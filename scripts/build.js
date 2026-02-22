const fs = require('fs');
const path = require('path');
const marked = require('marked');

const authors = ['angel', 'antonio', 'javi'];
const posts = [];

// Configuración de Marked (opcional, para resaltar código si fuera necesario)
marked.setOptions({
    headerIds: false,
    mangle: false
});

authors.forEach(author => {
    const authorDir = path.join(__dirname, author);
    if (!fs.existsSync(authorDir)) return;

    const files = fs.readdirSync(authorDir);
    
    // 1. PROCESAR MARKDOWNS Y GENERAR HTML
    files.forEach(file => {
        if (file.endsWith('.md')) {
            const filePath = path.join(authorDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            // Extraer Frontmatter
            const match = content.match(/---([\s\S]*?)---/);
            if (!match) return;

            const frontmatterRaw = match[1];
            const markdownContent = content.replace(match[0], '');

            const frontmatter = {};
            frontmatterRaw.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    let value = valueParts.join(':').trim();
                    // Limpiar comillas
                    value = value.replace(/^['"](.*)['"]$/, '$1');
                    
                    if (key.trim() === 'tags') {
                        frontmatter.tags = value.replace(/[\[\]]/g, '').split(',').map(t => t.trim());
                    } else {
                        frontmatter[key.trim()] = value;
                    }
                }
            });

            // Convertir a HTML
            const htmlContent = marked.parse(markdownContent);
            const template = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frontmatter.title} — NousArchives</title>
    <link rel="stylesheet" href="../style.css">
</head>
<body class="article-page">
    <nav class="topnav">
        <a href="../" class="nav-left">← Volver</a>
    </nav>
    <article class="post-content">
        <header class="post-header">
            <h1 class="post-page-title">${frontmatter.title}</h1>
            <div class="post-page-meta">
                <span>${frontmatter.author}</span> · <span>${frontmatter.date}</span>
            </div>
        </header>
        <div class="post-body">
            ${htmlContent}
        </div>
    </article>
</body>
</html>`;

            const outputFileName = file.replace('.md', '.html');
            const outputPath = path.join(authorDir, outputFileName);
            fs.writeFileSync(outputPath, template);

            // Añadir al índice global
            posts.push({
                ...frontmatter,
                url: `${author}/${outputFileName}`,
                authorSlug: author
            });
        }
    });

    // 2. LIMPIEZA AUTOMÁTICA
    // Borrar archivos .html que no tengan un .md correspondiente
    files.forEach(file => {
        if (file.endsWith('.html') && file !== 'index.html') {
            const mdFile = file.replace('.html', '.md');
            const mdPath = path.join(authorDir, mdFile);
            
            if (!fs.existsSync(mdPath)) {
                console.log(`🗑️ Limpiando: Borrando ${file} porque su .md no existe.`);
                fs.unlinkSync(path.join(authorDir, file));
            }
        }
    });
});

// Guardar posts.js ordenados por fecha (asumiendo formato "Mes Año")
const postsJsContent = `const POSTS = ${JSON.stringify(posts.reverse(), null, 2)};`;
fs.writeFileSync(path.join(__dirname, 'posts.js'), postsJsContent);

console.log(`✅ ${posts.length} entradas procesadas y limpieza completada.`);
