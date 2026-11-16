/* Knowing a Thing by Its Powers — interactive summary.
   Draws the charts from window.PAPER_DATA (data.js) and fills every figure from left to
   right as the reader scrolls through the steps next to it. No dependencies. */
(function () {
    'use strict';

    const D = window.PAPER_DATA;
    const root = document.querySelector('.kp');
    if (!root || !D) return;

    const NS = 'http://www.w3.org/2000/svg';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrowQuery = window.matchMedia('(max-width: 900px)');

    // Fixed series order and colors (color follows the model, never its rank)
    const SERIES = {
        TR:  { color: 'var(--s-tr)',  legend: 'TR (stored row)' },
        OV:  { color: 'var(--s-ov)',  legend: 'OV (reads interactions)' },
        MLP: { color: 'var(--s-mlp)', legend: 'MLP (stored row)' },
        FAC: { color: 'var(--s-fac)', legend: 'FAC (stored row, bilinear)' },
    };

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const fmtInt = v => v.toLocaleString('en-US');
    const fmtPct = p => (Math.round(p * 1000) / 10) + '%';

    function svgEl(tag, attrs, parent) {
        const el = document.createElementNS(NS, tag);
        for (const k in attrs) el.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(el);
        return el;
    }
    function htmlEl(tag, cls, text, parent) {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        if (text != null) el.textContent = text;
        if (parent) parent.appendChild(el);
        return el;
    }

    // ── LINE CHART ───────────────────────────────────────────────────────────
    function LineChart(fig, cfg) {
        const host = fig.querySelector('[data-chart]');
        const legendEl = fig.querySelector('[data-legend]');
        const tableEl = fig.querySelector('[data-table]');
        const tip = htmlEl('div', 'kp-tip', null, host);
        let reveal = reduceMotion ? 1 : 0;
        let focus = null;          // null = every series, or an array of keys
        let hover = -1;            // index of the hovered x position
        let g = null;              // geometry and nodes of the current render

        function build() {
            const series = cfg.series();
            const keys = cfg.keys;
            const xsData = series[keys[0]].map(pt => pt.x);
            const W = Math.max(280, host.clientWidth);
            const narrow = W < 460;
            let H = clamp(W * 0.64, 230, 430);
            if (narrowQuery.matches) H = Math.min(H, Math.max(200, window.innerHeight * 0.34));
            const m = { l: 38, r: narrow ? 66 : 80, t: 30, b: 46 };
            const pw = W - m.l - m.r, ph = H - m.t - m.b;
            const [x0, x1] = cfg.x.domain, [y0, y1] = cfg.y.domain;
            const sx = cfg.x.type === 'log'
                ? v => m.l + (Math.log(v) - Math.log(x0)) / (Math.log(x1) - Math.log(x0)) * pw
                : v => m.l + (v - x0) / (x1 - x0) * pw;
            const sy = v => m.t + (1 - (v - y0) / (y1 - y0)) * ph;

            const old = host.querySelector('svg');
            if (old) old.remove();
            const svg = svgEl('svg', { class: 'kp-chart', viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', tabindex: '0', 'aria-label': cfg.ariaLabel });
            host.insertBefore(svg, tip);

            // grid, axes, titles
            cfg.y.ticks.forEach(t => {
                const y = Math.round(sy(t)) + 0.5;
                svgEl('line', { class: t === cfg.y.baseline ? 'kp-baseline' : 'kp-gridline', x1: m.l, x2: m.l + pw, y1: y, y2: y }, svg);
                svgEl('text', { x: m.l - 7, y: y + 3.5, 'text-anchor': 'end' }, svg).textContent = (cfg.y.tickFmt || cfg.y.fmt)(t);
            });
            svgEl('text', { class: 'kp-axis-title', x: 0, y: 10 }, svg).textContent = cfg.y.title;
            cfg.x.ticks.forEach(t => {
                const x = sx(t.v);
                svgEl('line', { class: 'kp-baseline', x1: x, x2: x, y1: m.t + ph, y2: m.t + ph + 4 }, svg);
                svgEl('text', { x, y: m.t + ph + 16, 'text-anchor': 'middle' }, svg).textContent = t.label;
                if (t.sub && !(narrow && t.skipSubNarrow)) svgEl('text', { x, y: m.t + ph + 28, 'text-anchor': 'middle', opacity: 0.75 }, svg).textContent = t.sub;
            });
            svgEl('text', { class: 'kp-axis-title', x: m.l + pw / 2, y: H - 3, 'text-anchor': 'middle' }, svg).textContent = cfg.x.title;

            // data, clipped by the reveal rectangle
            const clipId = cfg.id + '-clip';
            const clipRect = svgEl('rect', { x: m.l - 8, y: 0, width: 0, height: H }, svgEl('clipPath', { id: clipId }, svgEl('defs', {}, svg)));
            const dataG = svgEl('g', { 'clip-path': `url(#${clipId})` }, svg);
            const groups = {};
            keys.forEach(key => {
                const pts = series[key], color = SERIES[key].color;
                const sg = svgEl('g', { class: 'kp-series' }, dataG);
                groups[key] = sg;
                if (cfg.band) {
                    const up = pts.map(p => `${sx(p.x).toFixed(1)},${sy(p.hi).toFixed(1)}`);
                    const down = pts.slice().reverse().map(p => `${sx(p.x).toFixed(1)},${sy(p.lo).toFixed(1)}`);
                    svgEl('path', { class: 'kp-band', d: 'M' + up.concat(down).join('L') + 'Z', fill: color }, sg);
                }
                if (cfg.whiskers) pts.forEach(p => {
                    svgEl('line', { class: 'kp-whisker', x1: sx(p.x), x2: sx(p.x), y1: sy(clamp(p.hi, y0, y1)), y2: sy(clamp(p.lo, y0, y1)), stroke: color }, sg);
                });
                svgEl('path', { class: 'kp-line', d: 'M' + pts.map(p => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('L'), stroke: color }, sg);
                pts.forEach(p => svgEl('circle', { class: 'kp-dot', cx: sx(p.x), cy: sy(p.y), r: 4, fill: color }, sg));
            });

            // end labels: spread apart when the line ends are close, with a leader line
            const ends = keys.map(key => {
                const p = series[key][series[key].length - 1];
                return { key, px: sx(p.x), py: sy(p.y), ly: sy(p.y), text: cfg.y.fmt(p.y) };
            }).sort((a, b) => a.py - b.py);
            const GAP = 14;
            for (let i = 1; i < ends.length; i++) ends[i].ly = Math.max(ends[i].ly, ends[i - 1].ly + GAP);
            const over = ends.length ? ends[ends.length - 1].ly - (m.t + ph - 2) : 0;
            if (over > 0) {
                ends[ends.length - 1].ly -= over;
                for (let i = ends.length - 2; i >= 0; i--) ends[i].ly = Math.min(ends[i].ly, ends[i + 1].ly - GAP);
            }
            const labels = {};
            ends.forEach(e => {
                const lg = svgEl('g', { class: 'kp-endlabel is-off' }, svg);
                if (Math.abs(e.ly - e.py) > 3) svgEl('line', { x1: e.px + 6, y1: e.py, x2: e.px + 11, y2: e.ly }, lg);
                const t = svgEl('text', { x: e.px + 13, y: e.ly + 3.5 }, lg);
                svgEl('tspan', {}, t).textContent = e.key + ' ';
                if (!narrow) svgEl('tspan', { class: 'kp-endval' }, t).textContent = e.text;
                labels[e.key] = lg;
            });

            // hover layer
            const cross = svgEl('line', { class: 'kp-cross', y1: m.t, y2: m.t + ph, x1: 0, x2: 0 }, svg);
            const hit = svgEl('rect', { class: 'kp-hit', x: m.l - 8, y: m.t - 6, width: pw + 16, height: ph + 12 }, svg);

            g = { W, H, m, pw, ph, sx, sy, svg, clipRect, groups, labels, cross, series, keys, xsData };

            function nearest(clientX) {
                const box = svg.getBoundingClientRect();
                const x = (clientX - box.left) * (W / box.width);
                let best = -1, bd = Infinity;
                xsData.forEach((v, i) => {
                    if (!isRevealed(i)) return;
                    const d = Math.abs(sx(v) - x);
                    if (d < bd) { bd = d; best = i; }
                });
                return best;
            }
            hit.addEventListener('pointermove', e => showTip(nearest(e.clientX)));
            hit.addEventListener('pointerdown', e => showTip(nearest(e.clientX)));
            hit.addEventListener('pointerleave', () => showTip(-1));
            svg.addEventListener('focus', () => showTip(lastRevealed()));
            svg.addEventListener('blur', () => showTip(-1));
            svg.addEventListener('keydown', e => {
                if (e.key === 'Escape') return showTip(-1);
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                e.preventDefault();
                const last = lastRevealed();
                if (last < 0) return;
                const cur = hover < 0 ? last : hover;
                showTip(clamp(cur + (e.key === 'ArrowRight' ? 1 : -1), 0, last));
            });

            buildLegend();
            buildTable();
            applyReveal();
            applyFocus();
        }

        function xFrac(v) { return g ? clamp((g.sx(v) - g.m.l) / g.pw, 0, 1) : 0; }
        function isRevealed(i) { return xFrac(g.xsData[i]) <= reveal + 0.012; }
        function lastRevealed() {
            let last = -1;
            g.xsData.forEach((v, i) => { if (isRevealed(i)) last = i; });
            return last;
        }

        function applyReveal() {
            if (!g) return;
            g.clipRect.setAttribute('width', reveal <= 0 ? 0 : (reveal * g.pw + 14).toFixed(1));
            // end labels appear once the last data point is filled in
            const done = reveal >= xFrac(g.xsData[g.xsData.length - 1]) - 0.005;
            g.keys.forEach(k => g.labels[k].classList.toggle('is-off', !done));
            if (hover >= 0 && !isRevealed(hover)) showTip(-1);
        }
        function applyFocus() {
            if (!g) return;
            g.keys.forEach(k => {
                const dim = !!focus && focus.indexOf(k) < 0;
                g.groups[k].classList.toggle('is-dim', dim);
                g.labels[k].classList.toggle('is-dim', dim);
                const leg = legendEl && legendEl.querySelector(`[data-key="${k}"]`);
                if (leg) leg.classList.toggle('is-dim', dim);
            });
        }

        function showTip(i) {
            hover = i;
            if (i < 0) { tip.classList.remove('is-on'); g.cross.classList.remove('is-on'); return; }
            const x = g.sx(g.xsData[i]);
            g.cross.setAttribute('x1', x); g.cross.setAttribute('x2', x);
            g.cross.classList.add('is-on');
            tip.textContent = '';
            htmlEl('div', 'kp-tip-title', cfg.tipTitle(g.series[g.keys[0]][i]), tip);
            g.keys.map(k => ({ k, p: g.series[k][i] })).sort((a, b) => b.p.y - a.p.y).forEach(({ k, p }) => {
                const row = htmlEl('div', 'kp-tip-row', null, tip);
                htmlEl('span', 'kp-key', null, row).style.background = SERIES[k].color;
                htmlEl('strong', null, cfg.y.fmt(p.y), row);
                htmlEl('span', null, k, row);
                if (cfg.tipExtra) htmlEl('em', null, cfg.tipExtra(p), row);
            });
            const scale = g.svg.getBoundingClientRect().width / g.W;
            const tw = tip.offsetWidth, hw = host.clientWidth;
            let left = x * scale + 12;
            if (left + tw > hw) left = x * scale - tw - 12;
            tip.style.transform = `translate(${Math.max(0, left).toFixed(0)}px, ${(g.m.t * scale + 4).toFixed(0)}px)`;
            tip.classList.add('is-on');
        }

        function buildLegend() {
            if (!legendEl) return;
            legendEl.textContent = '';
            cfg.keys.forEach(k => {
                const item = htmlEl('span', 'kp-leg', null, legendEl);
                item.dataset.key = k;
                htmlEl('span', 'kp-key', null, item).style.background = SERIES[k].color;
                htmlEl('span', null, SERIES[k].legend, item);
            });
        }
        function buildTable() {
            if (!tableEl) return;
            tableEl.textContent = '';
            const table = htmlEl('table', null, null, tableEl);
            const head = htmlEl('tr', null, null, htmlEl('thead', null, null, table));
            htmlEl('th', null, cfg.table.xHead, head);
            cfg.keys.forEach(k => htmlEl('th', null, k, head));
            const body = htmlEl('tbody', null, null, table);
            g.xsData.forEach((v, i) => {
                const tr = htmlEl('tr', null, null, body);
                htmlEl('td', null, cfg.table.xCell(g.series[cfg.keys[0]][i]), tr);
                cfg.keys.forEach(k => htmlEl('td', null, cfg.table.cell(g.series[k][i]), tr));
            });
        }

        build();
        return {
            render: build,
            xFrac,
            setReveal(f) { f = reduceMotion ? 1 : clamp(f, 0, 1); if (Math.abs(f - reveal) > 0.0005) { reveal = f; applyReveal(); } },
            setFocus(keys) { const a = keys ? keys.join() : '', b = focus ? focus.join() : ''; if (a !== b) { focus = keys; applyFocus(); } },
        };
    }

    // ── FIGURE 1 (inline SVG): a clip rectangle wipes it from left to right ──
    function ArchFigure(fig) {
        const svg = fig.querySelector('svg.kp-arch');
        const rect = svg.querySelector('#kp-arch-clip rect');
        let reveal = -1;
        function apply(f) {
            f = reduceMotion ? 1 : clamp(f, 0, 1);
            if (Math.abs(f - reveal) < 0.0005) return;
            reveal = f;
            rect.setAttribute('width', (640 * f).toFixed(1));
            // On narrow screens show one half at a time, at a readable size, and pan to OV
            if (narrowQuery.matches && !reduceMotion) svg.setAttribute('viewBox', `${(320 * clamp((f - 0.5) / 0.5, 0, 1)).toFixed(1)} 0 320 360`);
            else svg.setAttribute('viewBox', '0 0 640 360');
        }
        return { render() { const f = reveal; reveal = -1; apply(Math.max(f, 0)); }, xFrac: v => v, setReveal: apply, setFocus() {} };
    }

    // ── CHART DEFINITIONS ────────────────────────────────────────────────────
    const fmt3 = v => v.toFixed(3), fmt2 = v => v.toFixed(2), fmt1 = v => v.toFixed(1);
    const sizeTicks = D.curves.test_par.TR.map((pt, i) => ({ v: pt.n, label: fmtPct(pt.p), sub: fmtInt(pt.n), skipSubNarrow: i % 2 === 1 }));
    const sizeDomain = [950, 17400];
    const sizeTitle = 'Training interactions (fraction p)';
    const sizeTip = pt => `p = ${fmtPct(pt.p)} · ${fmtInt(pt.n)} interactions`;

    const figures = {};
    let split = 'test_par';

    const curvesFig = root.querySelector('[data-figure="curves"] .kp-figure');
    if (curvesFig) {
        figures.curves = LineChart(curvesFig, {
            id: 'kp-curves', keys: D.models, whiskers: true,
            series: () => {
                const out = {};
                D.models.forEach(k => { out[k] = D.curves[split][k].map(pt => ({ x: pt.n, y: pt.mean, lo: pt.mean - pt.ci, hi: pt.mean + pt.ci, p: pt.p, n: pt.n, ci: pt.ci })); });
                return out;
            },
            x: { type: 'log', domain: sizeDomain, ticks: sizeTicks, title: sizeTitle },
            y: { domain: [0.5, 1], ticks: [0.5, 0.6, 0.7, 0.8, 0.9, 1], baseline: 0.5, fmt: fmt3, tickFmt: fmt1, title: 'Test accuracy (chance = 0.5)' },
            tipTitle: sizeTip,
            tipExtra: pt => '± ' + pt.ci.toFixed(3),
            ariaLabel: 'Line chart of test accuracy against the number of training interactions for TR, OV, MLP and FAC. Use the left and right arrow keys to read the values.',
            table: { xHead: 'p (interactions)', xCell: pt => `${fmtPct(pt.p)} (${fmtInt(pt.n)})`, cell: pt => `${fmt3(pt.y)} ± ${pt.ci.toFixed(3)}` },
        });
        curvesFig.querySelectorAll('.kp-filters button').forEach(btn => {
            btn.addEventListener('click', () => {
                split = btn.dataset.split;
                curvesFig.querySelectorAll('.kp-filters button').forEach(b => {
                    b.classList.toggle('is-on', b === btn);
                    b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                });
                figures.curves.render();
            });
        });
    }

    const longFig = root.querySelector('[data-figure="long"] .kp-figure');
    if (longFig) {
        const all = [].concat(D.long.TR, D.long.OV);
        const yMin = Math.floor(Math.min.apply(null, all.map(p => p.min)) * 20) / 20;
        const yMax = Math.ceil(Math.max.apply(null, all.map(p => p.max)) * 20) / 20;
        const yTicks = [];
        for (let v = yMin; v <= yMax + 1e-9; v += 0.05) yTicks.push(Math.round(v * 100) / 100);
        figures.long = LineChart(longFig, {
            id: 'kp-long', keys: ['TR', 'OV'], band: true,
            series: () => {
                const out = {};
                ['TR', 'OV'].forEach(k => { out[k] = D.long[k].map(pt => ({ x: pt.step, y: pt.mean, lo: pt.min, hi: pt.max })); });
                return out;
            },
            x: { type: 'linear', domain: [0, 51500], ticks: [0, 10000, 20000, 30000, 40000, 50000].map(v => ({ v, label: v ? v / 1000 + 'K' : '0' })), title: 'Training steps' },
            y: { domain: [yMin, yMax], ticks: yTicks, baseline: yMin, fmt: fmt3, tickFmt: fmt2, title: 'Test accuracy on unseen pairs' },
            tipTitle: pt => `${fmtInt(pt.x)} steps`,
            tipExtra: pt => `${fmt3(pt.lo)} to ${fmt3(pt.hi)}`,
            ariaLabel: 'Line chart of test accuracy on unseen pairs during 50,000 training steps for TR and OV. Use the left and right arrow keys to read the values.',
            table: { xHead: 'Steps', xCell: pt => fmtInt(pt.x), cell: pt => `${fmt3(pt.y)} (${fmt3(pt.lo)} to ${fmt3(pt.hi)})` },
        });
    }

    const probeFig = root.querySelector('[data-figure="probe"] .kp-figure');
    if (probeFig) {
        const signed = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
        figures.probe = LineChart(probeFig, {
            id: 'kp-probe', keys: D.models,
            series: () => {
                const out = {};
                D.models.forEach(k => { out[k] = D.probe[k].map(pt => ({ x: pt.n, y: pt.r2, p: pt.p, n: pt.n, edit: pt.edit })); });
                return out;
            },
            x: { type: 'log', domain: sizeDomain, ticks: sizeTicks, title: sizeTitle },
            y: { domain: [-0.05, 0.9], ticks: [0, 0.2, 0.4, 0.6, 0.8], baseline: 0, fmt: fmt2, tickFmt: fmt1, title: 'R² of the linear probe' },
            tipTitle: sizeTip,
            tipExtra: pt => `edit ${signed(pt.edit)} pts`,
            ariaLabel: 'Line chart of the R² of a linear probe towards the constitution against the number of training interactions for TR, OV, MLP and FAC. Use the left and right arrow keys to read the values.',
            table: { xHead: 'p (interactions)', xCell: pt => `${fmtPct(pt.p)} (${fmtInt(pt.n)})`, cell: pt => `${fmt2(pt.y)} / ${signed(pt.edit)}` },
        });
    }

    const archFig = root.querySelector('[data-figure="arch"] .kp-figure');
    if (archFig) figures.arch = ArchFigure(archFig);

    // ── SCROLL: each step sets how far its figure is filled ─────────────────
    const scrollies = Array.prototype.map.call(root.querySelectorAll('.kp-scrolly'), section => ({
        section,
        figure: section.querySelector('.kp-figure'),
        fig: figures[section.dataset.figure],
        steps: Array.prototype.slice.call(section.querySelectorAll('.kp-step')),
    })).filter(s => s.fig && s.steps.length);

    function stepCenter(step) {
        const first = step.firstElementChild.getBoundingClientRect();
        const last = step.lastElementChild.getBoundingClientRect();
        return (first.top + last.bottom) / 2;
    }

    function updateScrolly(s) {
        const vh = window.innerHeight;
        const sr = s.section.getBoundingClientRect();
        if (sr.bottom < -vh || sr.top > 2 * vh) return;      // far from the viewport
        // the reading line: where a step counts as "being read"
        let anchor = vh * 0.56;
        if (narrowQuery.matches) {
            const fb = s.figure.getBoundingClientRect().bottom;
            anchor = fb + (vh - fb) * 0.45;
        }
        const centers = s.steps.map(stepCenter);
        const targets = s.steps.map(st => st.dataset.revealX ? s.fig.xFrac(+st.dataset.revealX) : +(st.dataset.reveal || 1));

        let active = 0, best = Infinity;
        centers.forEach((c, i) => { const d = Math.abs(c - anchor); if (d < best) { best = d; active = i; } });
        s.steps.forEach((st, i) => st.classList.toggle('is-active', i === active));

        // fill: reaches the target of a step a little before the step reaches the reading line
        const lead = t => clamp(t * 1.5, 0, 1);
        let reveal;
        if (centers[0] > anchor) {
            reveal = targets[0] * lead(1 - (centers[0] - anchor) / (vh * 0.55));
        } else {
            let i = 0;
            while (i + 1 < centers.length && centers[i + 1] <= anchor) i++;
            reveal = i + 1 < centers.length
                ? lerp(targets[i], targets[i + 1], lead((anchor - centers[i]) / (centers[i + 1] - centers[i])))
                : targets[i];
        }
        s.fig.setReveal(reveal);
        const f = s.steps[active].dataset.focus;
        s.fig.setFocus(f ? f.split(',') : null);
    }

    const progressBar = document.getElementById('progress-bar');
    function update() {
        scrollies.forEach(updateScrolly);
        if (progressBar) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = (max > 0 ? clamp(window.scrollY / max, 0, 1) * 100 : 0) + '%';
        }
    }

    function measureNav() {
        const nav = document.querySelector('.topnav');
        if (nav) root.style.setProperty('--kp-nav-h', nav.offsetHeight + 'px');
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => { ticking = false; update(); });
    }, { passive: true });

    let resizeTimer = null, lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            measureNav();
            // mobile browsers fire resize when the address bar hides: redraw only on a width change
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                Object.keys(figures).forEach(k => figures[k].render());
            }
            update();
        }, 150);
    });

    measureNav();
    Object.keys(figures).forEach(k => figures[k].render());   // the sticky offset may have changed the widths
    update();
    // The layout can move without a scroll (web fonts, the data tables opening): keep the state in step
    const refresh = () => { measureNav(); update(); };
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    if (window.ResizeObserver) new ResizeObserver(() => window.requestAnimationFrame(update)).observe(root);
})();
