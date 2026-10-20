/* page components: turn scene, video feedback, research row. Each guards for its element. */
(() => {
  // video feedback: a 14s simulated playback lights each timestamped note in turn (uses the real clip once one is added)
  const vf = document.querySelector(".vf");
  if (vf) {
    const notesEl = [...vf.querySelectorAll(".vf__notes li")], clock = vf.querySelector(".vf__clock"), vid = vf.querySelector("video");
    const D = 40, reduce = false; // the feedback clip is the content itself, so it plays with Reduce Motion on too
    let t0 = null, seen = false;
    new IntersectionObserver(es => {
      seen = es[0].isIntersecting;
      if (vid && !reduce) seen ? vid.play().catch(() => {}) : vid.pause();
    }, { threshold: .3 }).observe(vf);
    if (vid && reduce) vid.controls = true;
    const loop = now => {
      if (seen && !reduce) {
        if (t0 === null) t0 = now;
        const t = vid && vid.duration ? vid.currentTime : ((now - t0) / 1000) % D, dur = vid && vid.duration ? vid.duration : D;
        vf.style.setProperty("--vp", (t / dur).toFixed(4));
        clock.textContent = "0:" + String(Math.floor(t)).padStart(2, "0");
        let cur = -1;
        notesEl.forEach((li, i) => { const on = t >= +li.dataset.t; li.classList.toggle("on", on); if (on) cur = i; });
        notesEl.forEach((li, i) => li.classList.toggle("now", i === cur));
        vf.className = "vf" + (cur >= 0 ? " n" + cur : "");
      }
      requestAnimationFrame(loop);
    };
    if (reduce) notesEl.forEach(li => li.classList.add("on")); else requestAnimationFrame(loop);
  }
  // research row: a tap pauses it so a card can be read, tapping outside resumes
  const evg = document.querySelector(".evgrid");
  if (evg) {
    evg.addEventListener("touchstart", () => evg.classList.add("touched"), { passive: true });
    document.addEventListener("touchstart", e => { if (!evg.contains(e.target)) evg.classList.remove("touched"); }, { passive: true });
  }
  // the turn: three beats across each sticky turn scene
  document.querySelectorAll(".turn").forEach(turn => turn.addEventListener("scene", e => {
    const t = e.detail, s = t < .12 ? 0 : t < .4 ? 1 : t < .7 ? 2 : 3;
    if (turn.dataset.step != s) turn.dataset.step = s;
  }));
  // client app phone: tabs switch screens; auto-advance every 4.5s while in view, stops once the visitor picks a tab
  const cli = document.querySelector(".cli");
  if (cli) {
    const screen = cli.querySelector(".cli__screen"), tabs = [...cli.querySelectorAll(".cli__tabs button")], navs = [...cli.querySelectorAll(".cli__nav span")];
    let i = 0, auto = true, seen = false;
    const show = n => {
      i = n; screen.dataset.s = n;
      tabs.forEach((t, k) => t.setAttribute("aria-selected", k === n ? "true" : "false"));
      navs.forEach((t, k) => t.classList.toggle("on", k === n));
    };
    tabs.forEach((t, k) => t.addEventListener("click", () => { auto = false; show(k); }));
    new IntersectionObserver(es => { seen = es[0].isIntersecting; }, { threshold: .4 }).observe(cli);
    // screens cross-fade (no slide with Reduce Motion), so auto-advance stays on for everyone
    setInterval(() => { if (auto && seen) show((i + 1) % tabs.length); }, 4500);
  }
})();
