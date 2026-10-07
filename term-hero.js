// ── TERMINAL HERO ────────────────────────────────────────────────────────────
// Draws a name in box-drawing "ASCII" letters on a terminal grid, and on scroll
// scrambles the same lines into a second frame (the thesis).
// Box characters are drawn as real line segments (not font glyphs), so the grid
// connects perfectly regardless of which fonts the system has.
// Config: window.TERM_HERO = { nameWords, namePrompt, thesisPrompt, thesisArt, thesisText }
(function () {
    const COLS = 48;
    const ROWS = 16;

    // 3-row box font. Each glyph: 3 strings of equal width.
    const FONT = {
        A: ['╭─╮', '├─┤', '╵ ╵'],
        B: ['┌─╮', '├─┤', '└─╯'],
        C: ['╭──', '│  ', '╰──'],
        D: ['┌─╮', '│ │', '└─╯'],
        E: ['┌──', '├─ ', '└──'],
        G: ['╭──', '│╶┐', '╰─╯'],
        H: ['╷ ╷', '├─┤', '╵ ╵'],
        I: ['╷', '│', '╵'],
        L: ['╷  ', '│  ', '└──'],
        N: ['┌╮╷', '│││', '╵╰┘'],
        O: ['╭─╮', '│ │', '╰─╯'],
        P: ['┌─╮', '├─╯', '╵  '],
        S: ['╭──', '╰─╮', '──╯'],
        U: ['╷ ╷', '│ │', '╰─╯'],
        Z: ['──┐', '╭─╯', '└──'],
        ' ': [' ', ' ', ' '],
    };
    const ACCENT = '╱';

    // Edges each box char connects to: n e s w, r = rounded corner
    const BOX = {
        '─': 'ew', '│': 'ns', '┌': 'es', '┐': 'sw', '└': 'ne', '┘': 'nw',
        '╭': 'esr', '╮': 'swr', '╰': 'ner', '╯': 'nwr',
        '├': 'nes', '┤': 'nsw', '┬': 'esw', '┴': 'new', '┼': 'nesw',
        '╷': 's', '╵': 'n', '╶': 'e', '╴': 'w',
    };
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
            rows[0] += accented ? ' '.repeat(Math.floor(w / 2)) + ACCENT + ' '.repeat(w - Math.floor(w / 2) - 1) : ' '.repeat(w);
            for (let r = 0; r < 3; r++) rows[r + 1] += g[r];
        });
        return rows;
    }

    // Build a frame: array of ROWS strings, each COLS wide.
    // Each line: { text, kind: 'art'|'text'|'prompt', rail }
    function buildFrame(lines) {
        const grid = [];
        const kinds = [];
        lines.forEach(l => {
            if (l.kind === 'art') {
                const rows = artWord(l.text);
                const start = l.accentRow ? 0 : 1;
                for (let r = start; r < 4; r++) {
                    let s = rows[r];
                    if (l.rail && r === 3) s += ' ' + '─'.repeat(Math.max(0, COLS - s.length - 1));
                    grid.push(s); kinds.push('art');
                }
            } else {
                grid.push(l.text || ''); kinds.push(l.kind || 'text');
            }
        });
        while (grid.length < ROWS) { grid.push(''); kinds.push('text'); }
        return {
            rows: grid.slice(0, ROWS).map(s => [...s.padEnd(COLS)].slice(0, COLS)),
            kinds: kinds.slice(0, ROWS),
        };
    }

    // Deterministic per-cell noise
    function hash(r, c) {
        const x = Math.sin(r * 127.1 + c * 311.7) * 43758.5453;
        return x - Math.floor(x);
    }

    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000';
    }

    function init() {
        const cfg = window.TERM_HERO;
        const section = document.getElementById('term-hero');
        const canvas = document.getElementById('term-canvas');
        if (!cfg || !section || !canvas) return;

        const frameA = buildFrame([
            { text: cfg.namePrompt, kind: 'prompt' },
            { text: '' },
            ...cfg.nameWords.flatMap((w, i) => [
                { text: w, kind: 'art', rail: true, accentRow: /[^\u0000-\u007f]/.test(w) },
                ...(i < cfg.nameWords.length - 1 ? [{ text: '' }] : []),
            ]),
        ]);
        const frameB = buildFrame([
            { text: cfg.thesisPrompt, kind: 'prompt' },
            { text: '' },
            ...cfg.thesisArt.flatMap((w, i) => [
                { text: w, kind: 'art', rail: true },
                ...(i < cfg.thesisArt.length - 1 ? [{ text: '' }] : []),
            ]),
            { text: '' },
            ...cfg.thesisText.flatMap((t, i) => [{ text: t }, ...(i === 0 ? [{ text: '' }] : [])]),
        ]);

        // Cursor goes after the last non-empty cell of each frame
        function lastCell(frame) {
            for (let r = ROWS - 1; r >= 0; r--) {
                const s = frame.rows[r].join('').trimEnd();
                if (s.length) return { r, c: Math.min(COLS - 1, s.length + 1) };
            }
            return { r: 0, c: 0 };
        }
        const cursorA = lastCell(frameA);
        const cursorB = lastCell(frameB);

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) section.classList.add('term-static');

        const ctx = canvas.getContext('2d');
        let cw = 0, ch = 0, dpr = 1;

        function resize() {
            const w = canvas.parentElement.clientWidth;
            dpr = window.devicePixelRatio || 1;
            cw = w / COLS;
            ch = cw * 2;
            canvas.style.width = w + 'px';
            canvas.style.height = (ch * ROWS) + 'px';
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(ch * ROWS * dpr);
        }

        function drawBox(x, y, char, color) {
            const spec = BOX[char];
            ctx.strokeStyle = color;
            const cx = x + cw / 2, cy = y + ch / 2;
            if (char === ACCENT) {
                ctx.beginPath();
                ctx.moveTo(x + cw * 0.2, y + ch * 0.9);
                ctx.lineTo(x + cw * 0.8, y + ch * 0.35);
                ctx.stroke();
                return;
            }
            if (!spec) return;
            const rounded = spec.includes('r') && spec.replace('r', '').length === 2;
            ctx.beginPath();
            if (rounded) {
                // Quarter arc between the two connected edges, control point at centre
                const pts = { n: [cx, y], e: [x + cw, cy], s: [cx, y + ch], w: [x, cy] };
                const [a, b] = spec.replace('r', '').split('');
                ctx.moveTo(...pts[a]);
                ctx.arcTo(cx, cy, ...pts[b], cw / 2);
                ctx.lineTo(...pts[b]);
            } else {
                if (spec.includes('n')) { ctx.moveTo(cx, y); ctx.lineTo(cx, cy); }
                if (spec.includes('s')) { ctx.moveTo(cx, cy); ctx.lineTo(cx, y + ch); }
                if (spec.includes('w')) { ctx.moveTo(x, cy); ctx.lineTo(cx, cy); }
                if (spec.includes('e')) { ctx.moveTo(cx, cy); ctx.lineTo(x + cw, cy); }
            }
            ctx.stroke();
        }

        function drawCell(r, c, char, kind, fg, grey) {
            if (char === ' ') return;
            const x = c * cw, y = r * ch;
            if (BOX[char] || char === ACCENT) { drawBox(x, y, char, kind === 'prompt' ? grey : fg); return; }
            ctx.fillStyle = kind === 'prompt' ? grey : fg;
            ctx.fillText(char, x, y + ch / 2);
        }

        // progress: 0 = name, 1 = thesis. intro: 0..1 typing of the first frame
        function render(progress, intro, blinkOn) {
            const fg = cssVar('--black');
            const grey = cssVar('--grey');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, cw * COLS, ch * ROWS);
            ctx.lineWidth = Math.max(1, Math.min(2, cw / 12));
            ctx.lineCap = 'butt';
            ctx.font = `400 ${cw / 0.6}px 'JetBrains Mono', monospace`;
            ctx.textBaseline = 'middle';

            const frame = Math.floor(progress * 40);
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const n = hash(r, c);
                    // Left-to-right sweep with noise
                    const th = 0.15 + 0.55 * (c / COLS) + 0.25 * n;
                    let char, kind;
                    if (progress >= th) { char = frameB.rows[r][c]; kind = frameB.kinds[r]; }
                    else if (progress > th - 0.1) {
                        const a = frameA.rows[r][c], b = frameB.rows[r][c];
                        char = (a === ' ' && b === ' ') ? ' ' : NOISE[Math.floor(hash(r + frame, c) * NOISE.length)];
                        kind = 'art';
                    } else {
                        // Intro: cells appear row by row, left to right
                        const order = (r * COLS + c) / (ROWS * COLS);
                        if (intro < order) continue;
                        char = frameA.rows[r][c]; kind = frameA.kinds[r];
                    }
                    drawCell(r, c, char, kind, fg, grey);
                }
            }
            // Block cursor
            if (blinkOn) {
                const cur = progress >= 0.95 ? cursorB : progress <= 0.05 ? cursorA : null;
                if (cur && intro >= 1) {
                    ctx.fillStyle = fg;
                    ctx.fillRect(cur.c * cw + cw * 0.1, cur.r * ch + ch * 0.2, cw * 0.8, ch * 0.6);
                }
            }
        }

        function scrollProgress() {
            const rect = section.getBoundingClientRect();
            const total = section.offsetHeight - canvas.parentElement.offsetHeight;
            if (total <= 0) return 0;
            const raw = Math.min(1, Math.max(0, -rect.top / total));
            // Hold the name for the first part, finish the thesis before release
            return Math.min(1, Math.max(0, (raw - 0.12) / 0.7));
        }

        resize();
        window.addEventListener('resize', resize);

        if (reduced) {
            // No animation: name on this canvas, thesis on a second one below
            const canvasB = canvas.cloneNode();
            canvasB.removeAttribute('id');
            canvas.parentElement.appendChild(canvasB);
            const ctxA = ctx;
            const draw = () => {
                resize();
                canvasB.width = canvas.width; canvasB.height = canvas.height;
                canvasB.style.width = canvas.style.width; canvasB.style.height = canvas.style.height;
                render(1, 1, false);
                canvasB.getContext('2d').drawImage(canvas, 0, 0);
                ctxA.setTransform(1, 0, 0, 1, 0, 0);
                render(0, 1, false);
            };
            (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw);
            window.addEventListener('resize', draw);
            return;
        }

        const start = performance.now();
        function loop(now) {
            const intro = Math.min(1, (now - start) / 1400);
            const blinkOn = Math.floor(now / 530) % 2 === 0;
            render(scrollProgress(), intro, blinkOn);
            requestAnimationFrame(loop);
        }
        (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(loop));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
