// ── TERMINAL HERO + TITLES ───────────────────────────────────────────────────
// Draws text in box-drawing "ASCII" letters on a terminal grid.
//  · Hero (#term-hero): the name, which on scroll scrambles into the thesis.
//    Config: window.TERM_HERO = { namePrompt, nameWords, nameTagline, thesisPrompt, thesisArt, thesisText }
//  · Titles (.term-title[data-es][data-en]): section titles, centred between rails.
// Box characters are drawn as real line segments (not font glyphs), so the grid
// connects perfectly regardless of which fonts the system has.
(function () {
    const HERO_COLS = 48;
    const HERO_ROWS = 16;
    const TITLE_COLS = 112;

    // 3-row box font. Each glyph: 3 strings of equal width.
    // Non-box helpers for K: ╱ ╲ arms that stop at the letter's top/baseline (cell centre),
    // ⟨ = both arms meeting at the left-centre
    const FONT = {
        A: ['╭─╮', '├─┤', '╵ ╵'],
        B: ['┌─╮', '├─┤', '└─╯'],
        C: ['╭──', '│  ', '╰──'],
        D: ['┌─╮', '│ │', '└─╯'],
        E: ['┌──', '├─ ', '└──'],
        F: ['┌──', '├─ ', '╵  '],
        G: ['╭──', '│╶┐', '╰─╯'],
        H: ['╷ ╷', '├─┤', '╵ ╵'],
        I: ['╷', '│', '╵'],
        J: ['  ╷', '  │', '╰─╯'],
        K: ['╷ ╱', '├⟨ ', '╵ ╲'],
        L: ['╷  ', '│  ', '└──'],
        M: ['╭┬╮', '│││', '╵╵╵'],
        N: ['┌╮╷', '│││', '╵╰┘'],
        O: ['╭─╮', '│ │', '╰─╯'],
        P: ['┌─╮', '├─╯', '╵  '],
        R: ['┌─╮', '├┬╯', '╵╰─'],
        S: ['╭──', '╰─╮', '──╯'],
        T: ['─┬─', ' │ ', ' ╵ '],
        U: ['╷ ╷', '│ │', '╰─╯'],
        Y: ['╷ ╷', '╰┬╯', ' ╵ '],
        Z: ['──┐', '╭─╯', '└──'],
        ' ': [' ', ' ', ' '],
    };
    const ACCENT = '´';

    // Edges each box char connects to: n e s w, r = rounded corner
    const BOX = {
        '─': 'ew', '│': 'ns', '┌': 'es', '┐': 'sw', '└': 'ne', '┘': 'nw',
        '╭': 'esr', '╮': 'swr', '╰': 'ner', '╯': 'nwr',
        '├': 'nes', '┤': 'nsw', '┬': 'esw', '┴': 'new', '┼': 'nesw',
        '╷': 's', '╵': 'n', '╶': 'e', '╴': 'w',
    };
    const DIAG = new Set(['╱', '╲', '⟨', ACCENT]);
    const NOISE = Object.keys(BOX);

    // Render a word as 4 rows (accent row + 3 glyph rows)
    function artWord(word) {
        const rows = ['', '', '', ''];
        [...word.toUpperCase()].forEach((ch, i) => {
            const base = ch.normalize('NFD')[0];
            const accented = ch !== base;
            const g = FONT[base] || FONT[' '];
            const w = g[0].length;
            if (i > 0) rows.forEach((_, r) => rows[r] += ' ');
            const mid = Math.floor(w / 2);
            rows[0] += accented ? ' '.repeat(mid) + ACCENT + ' '.repeat(w - mid - 1) : ' '.repeat(w);
            for (let r = 0; r < 3; r++) rows[r + 1] += g[r];
        });
        return rows;
    }

    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000';
    }

    // Same line weight everywhere: derived from the hero grid at this width
    function lineWidthFor(width) {
        return Math.max(1, Math.min(2, width / HERO_COLS / 12));
    }

    // Deterministic per-cell noise
    function hash(r, c) {
        const x = Math.sin(r * 127.1 + c * 311.7) * 43758.5453;
        return x - Math.floor(x);
    }

    // Size a canvas for a grid and return a drawing context in CSS pixels
    function sizeCanvas(canvas, width, cw, ch, rows) {
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = width + 'px';
        canvas.style.height = (ch * rows) + 'px';
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(ch * rows * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return ctx;
    }

    function drawBox(ctx, x, y, cw, ch, char) {
        const cx = x + cw / 2, cy = y + ch / 2;
        ctx.beginPath();
        if (char === ACCENT) {
            ctx.moveTo(x + cw * 0.2, y + ch * 0.9);
            ctx.lineTo(x + cw * 0.8, y + ch * 0.35);
        } else if (char === '╱') {
            ctx.moveTo(x, y + ch); ctx.lineTo(x + cw, cy);
        } else if (char === '╲') {
            ctx.moveTo(x, y); ctx.lineTo(x + cw, cy);
        } else if (char === '⟨') {
            ctx.moveTo(x + cw, y); ctx.lineTo(x, cy); ctx.lineTo(x + cw, y + ch);
        } else {
            const spec = BOX[char];
            if (!spec) return;
            const edges = spec.replace('r', '');
            if (spec.includes('r')) {
                // Quarter arc between the two connected edges, control point at centre
                const pts = { n: [cx, y], e: [x + cw, cy], s: [cx, y + ch], w: [x, cy] };
                ctx.moveTo(...pts[edges[0]]);
                ctx.arcTo(cx, cy, ...pts[edges[1]], cw / 2);
                ctx.lineTo(...pts[edges[1]]);
            } else {
                if (edges.includes('n')) { ctx.moveTo(cx, y); ctx.lineTo(cx, cy); }
                if (edges.includes('s')) { ctx.moveTo(cx, cy); ctx.lineTo(cx, y + ch); }
                if (edges.includes('w')) { ctx.moveTo(x, cy); ctx.lineTo(cx, cy); }
                if (edges.includes('e')) { ctx.moveTo(cx, cy); ctx.lineTo(x + cw, cy); }
            }
        }
        ctx.stroke();
    }

    // Draw one cell: box/diagonal chars as lines, anything else as mono text
    function drawCell(ctx, r, c, cw, ch, char, color) {
        if (char === ' ') return;
        const x = c * cw, y = r * ch;
        if (BOX[char] || DIAG.has(char)) { ctx.strokeStyle = color; drawBox(ctx, x, y, cw, ch, char); return; }
        ctx.fillStyle = color;
        ctx.fillText(char, x, y + ch / 2);
    }

    function prepare(ctx, cw, lw) {
        ctx.lineWidth = lw;
        ctx.lineCap = 'butt';
        ctx.font = `400 ${cw / 0.6}px 'JetBrains Mono', monospace`;
        ctx.textBaseline = 'middle';
    }

    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const lang = () => document.documentElement.lang === 'en' ? 'en' : 'es';

    // ── SECTION TITLES ───────────────────────────────────────────────────────
    function initTitles() {
        const titles = [...document.querySelectorAll('.term-title')];
        if (!titles.length) return;

        function drawTitle(el) {
            const canvas = el.querySelector('canvas');
            const width = el.clientWidth;
            const cw = width / TITLE_COLS, ch = cw * 2;
            const art = artWord(el.dataset[lang()] || '').slice(1); // no accent row
            const start = Math.max(1, Math.floor((TITLE_COLS - art[0].length) / 2));
            const ctx = sizeCanvas(canvas, width, cw, ch, 3);
            prepare(ctx, cw, lineWidthFor(width));
            const fg = cssVar('--black');
            for (let r = 0; r < 3; r++) {
                // Rails on the baseline row, both sides, one cell of air around the word
                let row = ' '.repeat(start) + art[r];
                if (r === 2) row = '─'.repeat(start - 1) + ' ' + art[r] + ' ' + '─'.repeat(TITLE_COLS);
                [...row.padEnd(TITLE_COLS).slice(0, TITLE_COLS)].forEach((char, c) => drawCell(ctx, r, c, cw, ch, char, fg));
            }
        }
        const drawAll = () => titles.forEach(drawTitle);
        fontsReady.then(drawAll);
        window.addEventListener('resize', drawAll);
        // Redraw on language toggle (i18n.js sets <html lang>) and on dark-mode toggle
        new MutationObserver(drawAll).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });
    }

    // ── HERO ─────────────────────────────────────────────────────────────────
    // Build a frame: ROWS × COLS cells. Each line: { text, kind: 'art'|'text'|'prompt', rail, accentRow }
    function buildFrame(lines) {
        const grid = [], kinds = [];
        lines.forEach(l => {
            if (l.kind === 'art') {
                const rows = artWord(l.text);
                for (let r = l.accentRow ? 0 : 1; r < 4; r++) {
                    let s = rows[r];
                    if (l.rail && r === 3) s += ' ' + '─'.repeat(Math.max(0, HERO_COLS - s.length - 1));
                    grid.push(s); kinds.push('art');
                }
            } else {
                grid.push(l.text || ''); kinds.push(l.kind || 'text');
            }
        });
        while (grid.length < HERO_ROWS) { grid.push(''); kinds.push('text'); }
        return {
            rows: grid.slice(0, HERO_ROWS).map(s => [...s.padEnd(HERO_COLS)].slice(0, HERO_COLS)),
            kinds: kinds.slice(0, HERO_ROWS),
        };
    }

    function initHero() {
        const cfg = window.TERM_HERO;
        const section = document.getElementById('term-hero');
        const canvas = document.getElementById('term-canvas');
        if (!cfg || !section || !canvas) return;

        const words = list => list.flatMap((w, i) => [
            { text: w, kind: 'art', rail: true, accentRow: /[^\u0000-\u007f]/.test(w) },
            ...(i < list.length - 1 ? [{ text: '' }] : []),
        ]);
        const frameA = buildFrame([
            { text: cfg.namePrompt, kind: 'prompt' }, { text: '' },
            ...words(cfg.nameWords), { text: '' }, { text: cfg.nameTagline || '' },
        ]);
        const frameB = buildFrame([
            { text: cfg.thesisPrompt, kind: 'prompt' }, { text: '' },
            ...words(cfg.thesisArt), { text: '' },
            ...cfg.thesisText.flatMap((t, i) => [{ text: t }, ...(i === 0 ? [{ text: '' }] : [])]),
        ]);

        // Cursor goes after the last non-empty cell of each frame
        function lastCell(frame) {
            for (let r = HERO_ROWS - 1; r >= 0; r--) {
                const s = frame.rows[r].join('').trimEnd();
                if (s.length) return { r, c: Math.min(HERO_COLS - 1, s.length + 1) };
            }
            return { r: 0, c: 0 };
        }
        const cursorA = lastCell(frameA), cursorB = lastCell(frameB);

        let width = 0, cw = 0, ch = 0, ctx = null;
        function resize() {
            // Content width of the stage (clientWidth includes its padding)
            const stage = canvas.parentElement, cs = getComputedStyle(stage);
            width = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            cw = width / HERO_COLS; ch = cw * 2;
            ctx = sizeCanvas(canvas, width, cw, ch, HERO_ROWS);
        }

        // progress: 0 = name, 1 = thesis. intro: 0..1 typing of the first frame
        function render(progress, intro, blinkOn) {
            const fg = cssVar('--black'), grey = cssVar('--grey');
            ctx.clearRect(0, 0, width, ch * HERO_ROWS);
            prepare(ctx, cw, lineWidthFor(width));
            const tick = Math.floor(progress * 40);
            for (let r = 0; r < HERO_ROWS; r++) {
                for (let c = 0; c < HERO_COLS; c++) {
                    // Left-to-right sweep with noise
                    const th = 0.15 + 0.55 * (c / HERO_COLS) + 0.25 * hash(r, c);
                    let char, kind;
                    if (progress >= th) { char = frameB.rows[r][c]; kind = frameB.kinds[r]; }
                    else if (progress > th - 0.1) {
                        const blank = frameA.rows[r][c] === ' ' && frameB.rows[r][c] === ' ';
                        char = blank ? ' ' : NOISE[Math.floor(hash(r + tick, c) * NOISE.length)];
                        kind = 'art';
                    } else {
                        // Intro: cells appear row by row, left to right
                        if (intro < (r * HERO_COLS + c) / (HERO_ROWS * HERO_COLS)) continue;
                        char = frameA.rows[r][c]; kind = frameA.kinds[r];
                    }
                    drawCell(ctx, r, c, cw, ch, char, kind === 'prompt' ? grey : fg);
                }
            }
            const cur = progress >= 0.95 ? cursorB : progress <= 0.05 ? cursorA : null;
            if (blinkOn && cur && intro >= 1) {
                ctx.fillStyle = fg;
                ctx.fillRect(cur.c * cw + cw * 0.1, cur.r * ch + ch * 0.2, cw * 0.8, ch * 0.6);
            }
        }

        function scrollProgress() {
            const total = section.offsetHeight - canvas.parentElement.offsetHeight;
            if (total <= 0) return 0;
            const raw = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
            // Hold the name for the first part, finish the thesis before release
            return Math.min(1, Math.max(0, (raw - 0.12) / 0.7));
        }

        resize();
        window.addEventListener('resize', resize);

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // No animation: name on this canvas, thesis on a second one below
            section.classList.add('term-static');
            const canvasB = canvas.cloneNode();
            canvasB.removeAttribute('id');
            canvas.parentElement.appendChild(canvasB);
            const draw = () => {
                resize();
                render(1, 1, false);
                sizeCanvas(canvasB, width, cw, ch, HERO_ROWS).drawImage(canvas, 0, 0, width, ch * HERO_ROWS);
                render(0, 1, false);
            };
            fontsReady.then(draw);
            window.addEventListener('resize', draw);
            return;
        }

        const start = performance.now();
        function loop(now) {
            render(scrollProgress(), Math.min(1, (now - start) / 1400), Math.floor(now / 530) % 2 === 0);
            requestAnimationFrame(loop);
        }
        fontsReady.then(() => requestAnimationFrame(loop));
    }

    function init() { initHero(); initTitles(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
