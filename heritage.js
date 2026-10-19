/* CALLUM.B heritage motion. One rAF loop, transform + opacity only. */
(() => {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---- reveals ---- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
  $$(".rv,.rv-s,.ln,.rule,[data-in]").forEach(el => io.observe(el));

  /* ---- count-ups: data-count="-38" data-dec="1" ---- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    const sign = to < 0 ? "−" : (el.dataset.plus ? "+" : "");
    if (RM) { el.textContent = sign + (el.dataset.sep ? Math.abs(to).toLocaleString("en-GB") : Math.abs(to).toFixed(dec)); return; }
    const t0 = performance.now(), D = 1800;
    const tick = t => {
      const k = clamp((t - t0) / D), e2 = 1 - Math.pow(1 - k, 4);
      const v = Math.abs(to * e2);
      el.textContent = sign + (el.dataset.sep ? Math.round(v).toLocaleString("en-GB") : v.toFixed(dec));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* ---- nav: solid after the hero, hides on scroll down, returns on scroll up ---- */
  const nav = $(".nav");
  let lastY = scrollY;

  /* ---- thread of light ---- */
  const thread = $(".thread");
  const chaps = $$("[data-chap]");
  if (thread && chaps.length) {
    const ol = $("ol", thread);
    chaps.forEach((c, i) => {
      const li = document.createElement("li");
      li.style.top = (chaps.length === 1 ? 0 : (i / (chaps.length - 1)) * 100) + "%";
      li.innerHTML = `<a href="#${c.id}" aria-label="${c.dataset.chap}"><span class="dot"></span><span class="lbl">${String(i + 1).padStart(2, "0")} · ${c.dataset.chap}</span></a>`;
      ol.appendChild(li);
    });
  }
  const nodes = thread ? $$("li", thread) : [];

  /* ---- marquee, nudged by scroll velocity ---- */
  const rows = $$(".marquee__row");
  const mq = rows.map(r => ({ r, x: 0, w: 0 }));
  const sizeMq = () => mq.forEach(m => m.w = m.r.scrollWidth / 2);
  sizeMq();

  /* ---- parallax: data-par="0.15" (fraction of viewport offset) ---- */
  const pars = $$("[data-par]").map(el => ({ el, k: parseFloat(el.dataset.par) }));

  /* ---- sticky scenes: [data-scene] gets --t 0..1 across its scroll length ---- */
  const scenes = $$("[data-scene]");

  /* ---- pointer depth on the hero ---- */
  const hero = $(".hero");
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  if (hero && !RM && matchMedia("(pointer:fine)").matches) {
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      ptr.tx = (e.clientX - r.left) / r.width - .5;
      ptr.ty = (e.clientY - r.top) / r.height - .5;
    });
    hero.addEventListener("pointerleave", () => { ptr.tx = 0; ptr.ty = 0; });
  }
  const depth = $$("[data-depth]").map(el => ({ el, d: parseFloat(el.dataset.depth) }));

  /* ---- price card tilt + light follow ---- */
  $$(".price-feature").forEach(card => {
    if (RM || !matchMedia("(pointer:fine)").matches) return;
    const shine = $(".shine i", card);
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(1400px) rotateX(${(.5 - y) * 4}deg) rotateY(${(x - .5) * 5}deg) translateY(-4px)`;
      if (shine) shine.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  /* ---- loop ---- */
  let vy = 0;
  const frame = () => {
    const y = scrollY, vh = innerHeight, dy = y - lastY;
    vy = lerp(vy, dy, .12);

    if (nav) {
      nav.classList.toggle("solid", y > vh * .5);
      if (Math.abs(dy) > 4) nav.classList.toggle("hide", dy > 0 && y > vh * .9);
    }
    lastY = y;

    if (thread) {
      // head travels node to node: position = chapter index + progress through that chapter
      let active = 0;
      const tops = chaps.map(c => c.getBoundingClientRect().top);
      tops.forEach((t, i) => { if (t < vh * .55) active = i; });
      const max = document.documentElement.scrollHeight - vh;
      let p;
      if (active >= chaps.length - 1) p = 1;
      else {
        const a = tops[active] - vh * .55, b = tops[active + 1] - vh * .55;
        p = (active + clamp(-a / (b - a))) / (chaps.length - 1);
      }
      if (y >= max - 2) p = 1;
      thread.style.setProperty("--p", clamp(p).toFixed(4));
      nodes.forEach((n, i) => {
        n.classList.toggle("lit", i <= active && (y > 40 || i === 0));
        n.classList.toggle("active", i === active);
      });
      const light = $$(".gl,[data-light]").some(s => {
        if (s.hasAttribute("data-light") && parseFloat(getComputedStyle(s).getPropertyValue("--t") || 0) < .3) return false; const r = s.getBoundingClientRect(); return r.top < vh * .5 && r.bottom > vh * .5; });
      document.body.classList.toggle("on-light", light);
    }

    if (!RM) {
      mq.forEach((m, i) => {
        const dir = i % 2 ? 1 : -1;
        m.x += dir * (0.35 + Math.min(Math.abs(vy) * .25, 14));
        if (m.w) { if (m.x <= -m.w) m.x += m.w; if (m.x > 0) m.x -= m.w; }
        m.r.style.transform = `translate3d(${m.x}px,0,0)`;
      });

      pars.forEach(({ el, k }) => {
        const r = el.parentElement.getBoundingClientRect();
        const off = (r.top + r.height / 2 - vh / 2);
        el.style.transform = `translate3d(0,${(off * -k).toFixed(1)}px,0)`;
      });

      ptr.x = lerp(ptr.x, ptr.tx, .06); ptr.y = lerp(ptr.y, ptr.ty, .06);
      depth.forEach(({ el, d }) => {
        const s = el.dataset.sy ? y * parseFloat(el.dataset.sy) : 0;
        el.style.transform = `translate3d(${(ptr.x * d).toFixed(2)}px,${(ptr.y * d + s).toFixed(2)}px,0)`;
      });
    }

    scenes.forEach(sc => {
      const r = sc.getBoundingClientRect();
      const t = RM ? 1 : clamp(-r.top / (r.height - vh));
      sc.style.setProperty("--t", t.toFixed(4));
      sc.dispatchEvent(new CustomEvent("scene", { detail: t }));
    });

    requestAnimationFrame(frame);
  };
  addEventListener("resize", sizeMq);
  addEventListener("load", sizeMq);
  requestAnimationFrame(frame);

  /* hero intro once fonts are in, so the line masks don't jump */
  const go = () => document.documentElement.classList.add("ready");
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 60));
  setTimeout(go, 1500);
})();
