// 首页：按今天的节气挑选大图和"往年此时"的照片
(function () {
  const photos = window.PHOTOS || [];
  const TERMS = window.TERMS;
  const R = window.R || "";

  function solarLongitude(d) {
    // 与 build.py 相同的 Meeus 低精度公式，取北京时间当天 23:59
    const jd = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 15, 59) / 86400000 + 2440587.5;
    const t = (jd - 2451545) / 36525;
    const rad = Math.PI / 180;
    const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    const m = (357.52911 + 35999.05029 * t - 0.0001537 * t * t) * rad;
    const c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m)
      + (0.019993 - 0.000101 * t) * Math.sin(2 * m) + 0.000289 * Math.sin(3 * m);
    const om = (125.04 - 1934.136 * t) * rad;
    return (((l0 + c - 0.00569 - 0.00478 * Math.sin(om)) % 360) + 360) % 360;
  }
  const termOf = (d) => (Math.floor(solarLongitude(d) / 15) + 3) % 24;

  // 找当前节气的起止日期
  const today = new Date();
  const cur = termOf(today);
  let start = new Date(today), end = new Date(today);
  while (termOf(new Date(start.getTime() - 86400000)) === cur) start = new Date(start.getTime() - 86400000);
  while (termOf(new Date(end.getTime() + 86400000)) === cur) end = new Date(end.getTime() + 86400000);
  const CN = "〇一二三四五六七八九";
  const cn = (n) => n <= 10 ? (n === 10 ? "十" : CN[n]) : n < 20 ? "十" + CN[n % 10]
    : CN[Math.floor(n / 10)] + "十" + (n % 10 ? CN[n % 10] : "");
  const md = (d) => `${cn(d.getMonth() + 1)}月${cn(d.getDate())}日`;

  document.getElementById("term-name").textContent = TERMS[cur];
  document.getElementById("term-note").textContent = `${md(start)}至${md(end)}`;

  // 大图：同节气的精选 > 同节气横幅 > 相邻节气精选 > 任意精选 > 任意横幅
  const dist = (t) => Math.min((t - cur + 24) % 24, (cur - t + 24) % 24);
  const wide = (p) => p.r >= 1.3;
  const pools = [
    photos.filter((p) => p.term === cur && p.f && wide(p)),
    photos.filter((p) => p.term === cur && wide(p)),
    photos.filter((p) => dist(p.term) <= 1 && p.f && wide(p)),
    photos.filter((p) => p.f && wide(p)),
    photos.filter(wide), photos];
  const pool = pools.find((x) => x.length) || [];
  const hero = pool[Math.floor(Math.random() * pool.length)];
  const heroEl = document.getElementById("hero");
  if (hero) {
    const img = document.getElementById("hero-img");
    img.srcset = hero.s.split(", ").map((x) => R + x).join(", ");
    img.sizes = "100vw";
    img.src = R + hero.l;
    img.alt = hero.t;
    heroEl.style.background = hero.c;
    document.getElementById("hero-link").href = R + hero.u;
    document.getElementById("hero-cap").textContent = [hero.t, hero.pl, hero.y && hero.y + " 年" + (hero.term === cur ? TERMS[cur] : "")].filter(Boolean).join("，");
  } else {
    heroEl.classList.add("no-photo");
    document.getElementById("hero-cap").textContent = "还没有照片。把照片放进 originals/ 并标注后重新生成。";
  }
})();
