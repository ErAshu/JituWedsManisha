(() => {
  const intro = document.getElementById("intro");
  const openBtn = document.getElementById("openBtn");
  const audio = document.getElementById("bgm");
  const musicBtn = document.getElementById("musicBtn");
  const petalBox = document.querySelector(".petals");

  /* ---------- Toran (marigold garland) ---------- */
  const toran = document.querySelector(".toran");
  const buildToran = () => {
    toran.innerHTML = '<div class="bar"></div>';
    const w = window.innerWidth;
    const gap = w < 500 ? 34 : 46;
    const count = Math.floor(w / gap);
    for (let i = 0; i <= count; i++) {
      const x = i * gap + (w - count * gap) / 2;
      // mango leaf between strings
      const leaf = document.createElement("span");
      leaf.className = "leaf";
      leaf.style.left = x + gap / 2 - 10 + "px";
      toran.appendChild(leaf);

      const s = document.createElement("div");
      s.className = "string";
      s.style.left = x - 9 + "px";
      s.style.animationDelay = (i % 5) * -0.7 + "s";
      // longer strands toward the middle make a gentle "V" swag
      const fromCentre = Math.abs(i - count / 2) / (count / 2);
      const len = Math.round(4 + (1 - fromCentre) * (w < 500 ? 5 : 7));
      for (let j = 0; j < len; j++) {
        const f = document.createElement("span");
        f.className = "flower" + (j % 2 ? " y" : "");
        s.appendChild(f);
      }
      s.appendChild(Object.assign(document.createElement("span"), { className: "bell" }));
      toran.appendChild(s);
    }
  };
  buildToran();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(buildToran, 200); });

  /* ---------- Music ---------- */
  let musicAvailable = true;
  audio.addEventListener("error", () => { musicAvailable = false; musicBtn.hidden = true; });

  const playMusic = () => {
    if (!musicAvailable) return;
    audio.volume = 0;
    audio.play().then(() => {
      musicBtn.hidden = false;
      musicBtn.classList.add("playing");
      // gentle fade-in
      let v = 0;
      const fade = setInterval(() => {
        v = Math.min(0.7, v + 0.05);
        audio.volume = v;
        if (v >= 0.7) clearInterval(fade);
      }, 150);
    }).catch(() => { musicBtn.hidden = false; });
  };

  musicBtn.addEventListener("click", () => {
    if (audio.paused) { audio.volume = 0.7; audio.play(); musicBtn.classList.add("playing"); }
    else { audio.pause(); musicBtn.classList.remove("playing"); }
  });

  // pause when the tab is hidden, resume when back
  document.addEventListener("visibilitychange", () => {
    if (!musicBtn.classList.contains("playing")) return;
    document.hidden ? audio.pause() : audio.play().catch(() => {});
  });

  /* ---------- Petals ---------- */
  const colors = ["#f39c12", "#ffcc33", "#e74c3c", "#c8201f", "#ff8fa3", "#fff1b8"];
  const spawnPetal = () => {
    const p = document.createElement("span");
    p.className = "petal";
    const size = 10 + Math.random() * 12;
    const dur = 6 + Math.random() * 6;
    p.style.left = Math.random() * 100 + "vw";
    p.style.width = size + "px";
    p.style.height = size * 1.3 + "px";
    p.style.background = colors[(Math.random() * colors.length) | 0];
    p.style.animationDuration = dur + "s";
    p.style.setProperty("--drift", (Math.random() * 200 - 100) + "px");
    p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    petalBox.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000);
  };
  const burst = (n) => { for (let i = 0; i < n; i++) setTimeout(spawnPetal, i * 60); };
  let petalTimer;
  const startPetals = () => {
    burst(40);
    const rate = window.innerWidth < 600 ? 900 : 550;
    petalTimer = setInterval(() => { if (!document.hidden) spawnPetal(); }, rate);
  };

  /* ---------- Open the doors ---------- */
  const open = () => {
    if (intro.classList.contains("opening")) return;
    intro.classList.add("opening");
    playMusic();
    if (navigator.vibrate) navigator.vibrate(40);
    setTimeout(startPetals, 900);
    setTimeout(() => {
      intro.classList.add("opened");
      document.body.classList.remove("locked");
      revealVisible();
    }, 2300);
    setTimeout(() => intro.remove(), 3500);
  };
  openBtn.addEventListener("click", open);
  intro.addEventListener("click", (e) => { if (e.target !== openBtn) open(); });

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("show"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  const revealVisible = () => reveals.forEach((el) => io.observe(el));

  /* ---------- Countdown ---------- */
  const target = new Date("2026-12-10T00:00:00+05:30").getTime();
  const el = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5);  diff -= h * 36e5;
    const m = Math.floor(diff / 6e4);   diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    el("cd-d").textContent = pad(d);
    el("cd-h").textContent = pad(h);
    el("cd-m").textContent = pad(m);
    el("cd-s").textContent = pad(s);
    if (target - Date.now() <= 0) {
      document.getElementById("timer").innerHTML = '<p class="blessing">The auspicious day is here! 🪔</p>';
      clearInterval(cd);
    }
  };
  const cd = setInterval(tick, 1000);
  tick();

  /* ---------- Share ---------- */
  document.getElementById("shareBtn").addEventListener("click", async () => {
    const data = {
      title: "Jitendra ❤ Manisha · Shubh Vivah",
      text: "You are cordially invited to the wedding of Jitendra & Manisha on 10 Dec 2026, Ranchi 🪔",
      url: location.href,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        window.open("https://wa.me/?text=" + encodeURIComponent(data.text + "\n" + data.url), "_blank");
      }
    } catch (_) { /* user cancelled */ }
  });

  /* ---------- Stagger groups of reveals ---------- */
  document.querySelectorAll(".event-list, .info-grid, .vows, .couple-grid").forEach((group) => {
    [...group.children].forEach((c, i) => c.style.setProperty("--d", (i * 0.15) + "s"));
  });

  /* ---------- Spark burst helper ---------- */
  const sparkBurst = (x, y, n = 10, spread = 60) => {
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "tap-spark";
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const r = spread * (0.5 + Math.random() * 0.7);
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.setProperty("--x", Math.cos(a) * r + "px");
      s.style.setProperty("--y", Math.sin(a) * r + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 850);
    }
  };
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".coin, #intro, a, button, iframe")) return;
    sparkBurst(e.clientX, e.clientY, 8, 40);
  });

  /* ---------- Scratch card date reveal ---------- */
  const wrap = document.getElementById("scratch");
  const coins = [...wrap.querySelectorAll(".coin")];
  let scratchingNow = false;
  let revealedCount = 0;

  // Block page scroll while a finger is scratching (iOS + Android)
  document.addEventListener("touchmove", (e) => { if (scratchingNow) e.preventDefault(); }, { passive: false });

  coins.forEach((coin) => {
    const cv = coin.querySelector("canvas");
    const ctx = cv.getContext("2d");
    let w = 0, h = 0, last = null, moves = 0, finished = false, active = false;

    const paint = () => {
      if (finished) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = cv.offsetWidth; h = cv.offsetHeight;
      if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      // gold foil
      const g = ctx.createRadialGradient(w * .35, h * .3, 2, w / 2, h / 2, w * .7);
      g.addColorStop(0, "#fff4c2"); g.addColorStop(.35, "#e7b54a"); g.addColorStop(.75, "#b97c17"); g.addColorStop(1, "#7a4a08");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // foil texture
      ctx.globalAlpha = .18; ctx.strokeStyle = "#5a0d12"; ctx.lineWidth = 1;
      for (let i = -h; i < w; i += 7) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke(); }
      ctx.globalAlpha = 1;
      // mandala ring + heart
      ctx.strokeStyle = "rgba(90,13,18,.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, w * .36, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12;
        ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * w * .36, h / 2 + Math.sin(a) * w * .36, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(90,13,18,.5)"; ctx.fill();
      }
      ctx.fillStyle = "#7a1218"; ctx.font = `${w * .3}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("❤", w / 2, h / 2 + 2);
    };

    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height) };
    };
    const scratch = (p) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = w * .26;
      ctx.beginPath();
      ctx.moveTo((last || p).x, (last || p).y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
      if (++moves % 6 === 0) check();
    };
    const check = () => {
      const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 64) { total++; if (data[i] < 100) clear++; }
      // the coin is round: corners are never visible, so ~50% needs most of the face is uncovered
      if (clear / total > 0.5) finish();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      coin.classList.add("done");
      const r = coin.getBoundingClientRect();
      sparkBurst(r.left + r.width / 2, r.top + r.height / 2, 16, 80);
      if (navigator.vibrate) navigator.vibrate(30);
      if (++revealedCount === coins.length) {
        wrap.classList.add("revealed");
        burst(60);
        if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
      }
    };
    const end = () => { if (!active) return; active = false; scratchingNow = false; last = null; document.body.classList.remove("scratching"); if (!finished) check(); };

    cv.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
    cv.addEventListener("pointerdown", (e) => {
      if (finished) return;
      active = scratchingNow = true;
      document.body.classList.add("scratching");
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      scratch(pos(e));
    });
    cv.addEventListener("pointermove", (e) => { if (active && !finished) scratch(pos(e)); });
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    cv.addEventListener("lostpointercapture", end);

    paint();
    if (document.fonts) document.fonts.ready.then(paint);
    window.addEventListener("resize", () => { if (!finished && !moves) paint(); });
  });

  /* ---------- Twinkling sparkles in hero ---------- */
  const sc = document.querySelector(".sparkles");
  if (sc && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const sx = sc.getContext("2d");
    let stars = [], running = true, SW = 0, SH = 0;
    const sizeIt = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      SW = sc.offsetWidth; SH = sc.offsetHeight;
      sc.width = SW * dpr; sc.height = SH * dpr; sx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = SW < 600 ? 35 : 60;
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * SW, y: Math.random() * SH, r: .6 + Math.random() * 1.8,
        p: Math.random() * Math.PI * 2, s: .01 + Math.random() * .03, vy: -.05 - Math.random() * .15,
      }));
    };
    const draw = () => {
      if (running) {
        sx.clearRect(0, 0, SW, SH);
        for (const st of stars) {
          st.p += st.s; st.y += st.vy; if (st.y < -5) st.y = SH + 5;
          const a = (Math.sin(st.p) + 1) / 2;
          sx.globalAlpha = a * .9;
          sx.fillStyle = "#ffe9a0";
          sx.beginPath(); sx.arc(st.x, st.y, st.r, 0, Math.PI * 2); sx.fill();
          if (st.r > 1.8 && a > .7) { // cross glint
            sx.strokeStyle = "#fff6cf"; sx.lineWidth = .7;
            sx.beginPath(); sx.moveTo(st.x - st.r * 3, st.y); sx.lineTo(st.x + st.r * 3, st.y);
            sx.moveTo(st.x, st.y - st.r * 3); sx.lineTo(st.x, st.y + st.r * 3); sx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    sizeIt(); draw();
    window.addEventListener("resize", sizeIt);
    new IntersectionObserver(([en]) => { running = en.isIntersecting; }).observe(sc);
  }

  /* ---------- Add to calendar (.ics) ---------- */
  document.getElementById("calBtn").addEventListener("click", () => {
    const ev = [
      ["20261208", "20261209", "Haldi — Jitendra & Manisha", "Tiril, Kokar, Ranchi"],
      ["20261209", "20261210", "Mehandi — Jitendra & Manisha", "Tiril, Kokar, Ranchi"],
      ["20261210", "20261211", "Shubh Vivah — Jitendra & Manisha", "Saket Nagar, Hinoo, Ranchi 834009"],
      ["20261212", "20261213", "Reception — Jitendra & Manisha", "Tiril Basti, Kokar, Ranchi 834001"],
    ];
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//JitendraWedsManisha//Invite//EN", "CALSCALE:GREGORIAN",
      ...ev.flatMap(([s, e, t, l], i) => [
        "BEGIN:VEVENT", `UID:jm-wedding-${i}@invite`, `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${s}`, `DTEND;VALUE=DATE:${e}`,
        `SUMMARY:${t}`, `LOCATION:${l.replace(/,/g, "\\,")}`, "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "Jitendra-Manisha-Wedding.ics";
    document.body.appendChild(a); a.click(); a.remove();
  });
})();
