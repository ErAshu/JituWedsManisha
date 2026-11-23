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
})();
