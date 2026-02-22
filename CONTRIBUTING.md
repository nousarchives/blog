# Cómo publicar en NousArchives

El proceso tiene dos pasos: escribir el artículo y subirlo. Nada más.

---

## Lo que necesitas saber

Escribes en **Markdown**, un formato de texto muy simple. El sistema convierte tu archivo en una página web automáticamente en menos de un minuto.

---

## Paso 1 — Escribir el artículo

Crea un archivo de texto con extensión `.md`. Empieza siempre con esta cabecera:

```
---
title: El título de tu entrada
tldr: Una o dos frases que resuman de qué va.
date: 2026-02-22
type: articulo
tags: [cine, literatura]
readtime: 8 min
---

Aquí empieza el texto del artículo.
```

### Campos de la cabecera

| Campo | Qué poner |
|-------|-----------|
| `title` | El título, sin comillas |
| `tldr` | Resumen breve para la portada |
| `date` | Fecha en formato `AAAA-MM-DD` |
| `type` | `articulo`, `comentario`, `respuesta` o `ensayo` |
| `tags` | Secciones: `ia`, `cine`, `literatura`, `musica`, `ml`, `derecho` |
| `readtime` | Tiempo estimado de lectura, ej: `6 min` |

### Formato del texto (Markdown básico)

```markdown
## Esto es un subtítulo

Un párrafo normal. Puedes poner **negrita** o *cursiva*.

> Esto es una cita destacada.

- Punto de una lista
- Otro punto
```

---

## Paso 2 — Subir el archivo a GitHub

### Si usas Git (el que sabe)

```bash
# Copia tu .md a tu carpeta (angel/, javi/, antonio/)
git add .
git commit -m "Add: título del artículo"
git push
```

### Si no usas Git (el resto) — desde el navegador

1. Ve a **github.com/[usuario]/nousarchives**
2. Navega a tu carpeta (`angel/`, `javi/` o `antonio/`)
3. Haz click en **"Add file" → "Create new file"**
4. Nombre del archivo: `nombre-de-tu-articulo.md`
5. Pega tu contenido con la cabecera arriba
6. Abajo, click en **"Commit changes"**

Listo. En 30–60 segundos tu artículo aparece publicado en la web.

---

## Qué pasa automáticamente después de subir

```
tu .md
  → se convierte en .html con el diseño del blog
  → se añade a la lista de publicaciones en portada
  → se actualiza tu página de autor
  → se hace commit y se publica
```

No tienes que tocar ningún otro archivo.

---

## Añadir un nuevo autor

Cualquiera puede publicar en NousArchives. Para añadir a alguien nuevo:

1. El que sabe Git crea la carpeta `nombre/` con su `index.html` (copiar el de Javi)
2. Añade al nuevo autor en `scripts/build.js` en el objeto `AUTHORS`
3. El nuevo autor ya puede subir sus `.md` directamente desde el navegador

---

## Preguntas frecuentes

**¿Puedo editar un artículo ya publicado?**
Modifica el `.md` y vuelve a hacer commit. Se regenera solo.

**¿El nombre del archivo importa?**
Sí, se convierte en la URL. Usa minúsculas y guiones: `mi-articulo-sobre-cine.md`

**¿Qué pasa si me equivoco en la cabecera?**
El Action fallará y te avisará. El artículo no se publica hasta que lo corrijas.

**¿Puedo poner imágenes?**
Sí. Sube la imagen a tu carpeta y refiérela en el Markdown:
`![Descripción](nombre-imagen.jpg)`
