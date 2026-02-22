# Cómo publicar en NousArchives

Este es un sitio estático en GitHub Pages. No hay CMS ni base de datos. Para publicar, se añaden archivos HTML directamente al repositorio. Aquí el proceso completo.

---

## Estructura de carpetas

```
nousarchives/
├── index.html              ← home principal
├── style.css               ← CSS compartido por todas las páginas
├── angel/
│   ├── index.html          ← perfil de Ángel
│   └── nombre-articulo.html
├── javi/
│   ├── index.html
│   └── nombre-articulo.html
├── antonio/
│   ├── index.html
│   ├── tfg-nousarchives.html
│   └── nombre-articulo.html
└── CONTRIBUTING.md
```

---

## Paso a paso para publicar un artículo

### 1. Crear el archivo HTML del artículo

Dentro de tu carpeta (`angel/`, `javi/`, `antonio/`), crea un archivo `.html`. Usa kebab-case para el nombre: `mi-articulo-sobre-cine.html`.

Copia esta plantilla y rellena los campos marcados con `[]:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[TITULO] — NousArchives</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body>

    <nav class="topnav">
        <a href="../" class="nav-left">← NousArchives</a>
        <span class="nav-center">[TU NOMBRE]</span>
        <div class="nav-links">
            <a href="../angel/">Ángel</a>
            <a href="../javi/">Javi</a>
            <a href="../antonio/">Antonio</a>
        </div>
    </nav>

    <header class="article-header">
        <div class="article-meta-top">
            <span>[TU NOMBRE]</span>
            <span class="dot">·</span>
            <span>[MES AÑO, ej: Febrero 2026]</span>
            <span class="dot">·</span>
            <span>[TIPO: Artículo / Comentario / Ensayo / Respuesta]</span>
        </div>

        <h1 class="article-title">[TÍTULO DEL ARTÍCULO]</h1>

        <p class="article-subtitle">[SUBTÍTULO O DESCRIPCIÓN BREVE — una o dos frases]</p>

        <div class="article-tags">
            <!-- Pon aquí las etiquetas. Valores posibles: ia, cine, literatura, musica, ml, derecho -->
            <span class="pub-tag">cine</span>
            <span class="pub-tag">literatura</span>
        </div>
    </header>

    <div class="article-body">

        <p>Primer párrafo del artículo.</p>

        <p>Segundo párrafo.</p>

        <h2>Un subtítulo</h2>

        <p>Más contenido...</p>

        <blockquote>
            Una cita que quieras destacar.
        </blockquote>

        <!-- Nota al pie opcional -->
        <p class="article-nota">
            Nota: cualquier aclaración o fuente que quieras añadir al final.
        </p>

    </div>

    <footer class="footer">
        <div class="footer-top">
            <a href="../" class="footer-logo">NousArchives</a>
            <nav class="footer-nav">
                <a href="../angel/">Ángel</a>
                <a href="../javi/">Javi</a>
                <a href="../antonio/">Antonio</a>
            </nav>
        </div>
        <div class="footer-bottom">
            <span>© 2026 NousArchives — Murcia</span>
            <span>CC BY-NC-SA 4.0</span>
        </div>
    </footer>

</body>
</html>
```

---

### 2. Añadir la entrada a tu página de autor (`tunom/index.html`)

Dentro de `<div class="pub-list">`, añade un bloque `.pub-item` apuntando al nuevo archivo:

```html
<a href="nombre-articulo.html" class="pub-item">
    <div class="pub-left">
        <span class="pub-author">[Tu nombre]</span>
        <span class="pub-date">[Feb 2026]</span>
    </div>
    <div class="pub-center">
        <span class="pub-title">[Título]</span>
        <span class="pub-tldr">[Descripción breve / TLDR]</span>
        <div class="pub-tags">
            <span class="pub-tag">cine</span>
        </div>
    </div>
    <div class="pub-right">
        <span class="pub-type articulo">Artículo</span>
        <!-- Tipos disponibles: articulo / comentario / respuesta / ensayo -->
        <span class="pub-readtime">5 min</span>
    </div>
</a>
```

También actualiza el contador en la cabecera del autor:
```html
<span>2 entradas</span>  <!-- cambia el número -->
```

---

### 3. Añadir la entrada a la home (`index.html`)

Copia el mismo bloque `.pub-item` dentro del `<div class="pub-list" id="pub-list">` de la home. Importante: añade el atributo `data-tags` con las secciones separadas por espacio para que funcione el filtro:

```html
<a href="antonio/nombre-articulo.html" class="pub-item" data-tags="cine literatura">
    ...
</a>
```

Los valores válidos para `data-tags` son: `ia`, `cine`, `literatura`, `musica`, `ml`, `derecho`.

También actualiza el contador en la tarjeta del autor en la home:
```html
<span class="author-column-count">2 entradas</span>
```

---

### 4. Subir a GitHub

```bash
git add .
git commit -m "Add: [título del artículo] por [nombre]"
git push
```

GitHub Pages publicará los cambios en cuestión de segundos.

---

## Tipos de publicación disponibles

| Clase CSS     | Uso                                         |
|---------------|---------------------------------------------|
| `articulo`    | Textos largos con desarrollo propio         |
| `comentario`  | Notas cortas, apuntes, observaciones        |
| `respuesta`   | Respuesta directa a algo o a alguien        |
| `ensayo`      | Textos académicos o de investigación        |

---

## Secciones (tags) disponibles

`ia` · `cine` · `literatura` · `musica` · `ml` · `derecho`

Si queréis añadir una nueva sección, hay que añadir el botón en `index.html`:
```html
<button class="tag-btn" data-tag="nueva-seccion">Nueva sección</button>
```

---

## Abrir el blog a más autores

Para añadir un nuevo autor:
1. Crear carpeta `nombre/` con su `index.html` (copiar el de Javi como plantilla)
2. Añadir su columna en el grid de autores en `index.html`
3. Añadir su enlace en la nav de todas las páginas

No hay límite de autores.
