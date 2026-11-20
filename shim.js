// Minimal stand-in for the dashboard runtime, so the same page code runs as a standalone web app.
// Data: the XauBot status.json kept in a secret GitHub Gist by the PC uploader (see upload_status.ps1).
(function () {
  const cfg = window.XAUBOT_CONFIG || {};
  const S = { calcs: {}, draws: {}, onData: [], raw: { status: 'loading', data: null, message: '' }, cache: {}, etag: null, last: 0, busy: false };
  const mounted = new WeakMap();

  function runDraw(name) {
    const d = S.draws[name];
    if (!d) return;
    document.querySelectorAll('[data-draw="' + name + '"]').forEach((el) => {
      if (el.closest('[hidden]')) return;
      try {
        if (d.mount && !mounted.has(el)) { el.replaceChildren(); mounted.set(el, d.mount(el)); }
        d.update(el, mounted.get(el));
      } catch (e) { console.error('draw ' + name, e); }
    });
  }
  function runAll() {
    S.onData.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    Object.keys(S.draws).forEach(runDraw);
    const banner = document.getElementById('xa-error');
    if (banner) {
      banner.hidden = S.raw.status !== 'error';
      banner.textContent = S.raw.status === 'error' ? 'Could not load live data: ' + S.raw.message : '';
    }
  }

  async function load(force) {
    if (S.busy || !cfg.gistId) return;
    if (!force && Date.now() - S.last < (cfg.minRefreshMs || 75000)) return;   // GitHub allows 60 unauthenticated calls per hour
    S.busy = true; S.last = Date.now();
    try {
      const headers = { Accept: 'application/vnd.github+json' };
      if (S.etag) headers['If-None-Match'] = S.etag;
      const res = await fetch('https://api.github.com/gists/' + cfg.gistId, { headers, cache: 'no-store' });
      if (res.status === 304) { S.busy = false; return; }
      if (!res.ok) throw new Error(res.status === 403 ? 'GitHub rate limit reached, retrying in a few minutes' : 'GitHub answered ' + res.status);
      S.etag = res.headers.get('ETag');
      const gist = await res.json();
      const f = gist.files && gist.files['status.json'];
      if (!f) throw new Error('status.json is missing from the gist');
      const text = f.truncated ? await (await fetch(f.raw_url, { cache: 'no-store' })).text() : f.content;
      S.raw = { status: 'ok', data: JSON.parse(text), message: '' };
      S.cache = {};
    } catch (e) {
      if (S.raw.status !== 'ok') S.raw = { status: 'error', data: null, message: e.message || String(e) };
      else console.warn('refresh failed, keeping last data:', e);
    }
    S.busy = false;
    runAll();
  }

  window.dash = {
    colors: ['var(--xa-cyan)', 'var(--xa-up)', 'var(--xa-down)'],
    loader() { /* the gist holds plain JSON, no loader needed */ },
    calc(id, def) { S.calcs[id] = def; },
    data(id) {
      if (id === 'status') return { status: S.raw.status, data: S.raw.data, message: S.raw.message };
      const c = S.calcs[id];
      if (!c) return { status: 'missing', data: [] };
      if (S.raw.status !== 'ok') return { status: S.raw.status, data: [], message: S.raw.message };
      if (!(id in S.cache)) {
        try { S.cache[id] = c.fn(...c.inputs.map((i) => (i === 'status' ? S.raw.data : window.dash.data(i).data))); }
        catch (e) { console.error('calc ' + id, e); return { status: 'error', data: [], message: e.message }; }
      }
      return { status: 'ok', data: S.cache[id] };
    },
    onData(fn) { S.onData.push(fn); try { fn(); } catch (e) { /* data not ready yet */ } },
    draw(name, def) {
      if (arguments.length === 1) { runDraw(name); return; }
      S.draws[name] = typeof def === 'function' ? { update: (el) => def(el) } : def;
    },
    refresh() { load(false); },
    setLink(name) { try { history.replaceState(null, '', '#' + name); } catch (e) { /* ignore */ } setTimeout(runAll, 0); },
    params() { return {}; }, setParams() {}, resetParams() {},
    start() {
      runAll();
      load(true);
      setInterval(() => { if (!document.hidden) load(false); }, 20000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) load(false); });
      let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(runAll, 150); });
    }
  };
})();
