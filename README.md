# NousArchives

Blog colaborativo estático. Autores: Ángel Allepuz, Javi Guerrero, Antonio Susarte.

## Cómo publicar un artículo

### 1. Trabaja en tu rama

Cada autor tiene su propia rama:

| Autor   | Rama      |
|---------|-----------|
| Ángel   | `angel`   |
| Javi    | `javi`    |
| Antonio | `antonio` |

Escribe tu artículo en tu rama, dentro de tu carpeta (`angel/`, `javi/`, `antonio/`).

### 2. Frontmatter obligatorio

Cada `.md` debe empezar con este bloque YAML:

```yaml
---
title: El título real de tu artículo
tldr: 1-2 frases que resuman de qué va.
date: YYYY-MM-DD
type: articulo|comentario|respuesta|ensayo
tags: [ia, cine, literatura, musica, ml, derecho]
readtime: 8 min
authorSlug: angel|javi|antonio
---
```

El campo `title` no puede ser un placeholder. Si el build detecta un título vacío, salta el archivo.

### 3. Abre un Pull Request a `main`

Cuando el artículo esté listo, abre un PR desde tu rama hacia `main` en GitHub.

- Solo el admin (`allepuzz`) puede aprobar y mergear PRs a `main`.
- Push directo a `main` está bloqueado.

### 4. Build automático

Al mergear el PR, GitHub Actions ejecuta automáticamente:

1. `npm install`
2. `node scripts/build.js` — genera los `.html` y actualiza `posts.js`
3. El bot hace commit y push de los archivos generados con `[skip ci]`

GitHub Pages sirve el resultado en cuanto el bot pushea.

---

## Protección de rama (configurado en GitHub)

`main` tiene estas reglas activas:

- Require a pull request before merging
- Require approvals: 1 (solo el admin puede aprobar)
- Block force pushes
- Do not allow bypassing the above settings

---

## Licencias

- **Contenido** (textos, artículos): © 2026 NousArchives. Licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- **Código** (templates, CSS, JS, configuración): Licencia [MIT](LICENSE)

---

## Arquitectura técnica

Ver `CLAUDE.md` para documentación del build pipeline y la arquitectura interna del proyecto.
