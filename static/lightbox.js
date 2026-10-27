// 全屏画廊：页面上所有带 data-lb 的链接，点击后在当前页全屏浏览，←/→ 翻页，Esc 关闭
(function () {
  const items = () => [...document.querySelectorAll("a[data-lb]")].filter((a) => a.offsetParent !== null);
  let list = [], idx = 0, box, img, cap, count, detail, lastFocus;

  function build() {
    box = document.createElement("div");
    box.className = "lb";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "照片浏览");
    box.innerHTML = `
      <div class="lb-stage"><img class="lb-img" alt=""></div>
      <button class="lb-btn lb-prev" type="button" aria-label="上一张"></button>
      <button class="lb-btn lb-next" type="button" aria-label="下一张"></button>
      <div class="lb-bar">
        <div class="lb-cap"></div>
        <div class="lb-tools"><span class="lb-count"></span><a class="lb-detail" href="#">照片信息</a><button class="lb-close" type="button">关闭</button></div>
      </div>`;
    document.body.appendChild(box);
    img = box.querySelector(".lb-img");
    cap = box.querySelector(".lb-cap");
    count = box.querySelector(".lb-count");
    detail = box.querySelector(".lb-detail");
    box.querySelector(".lb-prev").onclick = () => go(-1);
    box.querySelector(".lb-next").onclick = () => go(1);
    box.querySelector(".lb-close").onclick = close;
    box.querySelector(".lb-stage").addEventListener("click", (e) => { if (e.target !== img) close(); });
    let x0 = null;
    box.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }

  function show() {
    const a = list[idx];
    img.removeAttribute("src");
    img.style.background = a.dataset.color || "";
    img.style.aspectRatio = a.dataset.ratio || "";
    img.srcset = a.dataset.srcset || "";
    img.sizes = "100vw";
    img.src = a.dataset.full;
    img.alt = a.dataset.title || "";
    cap.innerHTML = "";
    const t = document.createElement("strong");
    t.textContent = a.dataset.title || "";
    const m = document.createElement("span");
    m.textContent = a.dataset.meta || "";
    cap.append(t, m);
    count.textContent = `${idx + 1} / ${list.length}`;
    detail.href = a.href;
    box.querySelector(".lb-prev").hidden = idx === 0;
    box.querySelector(".lb-next").hidden = idx === list.length - 1;
    history.replaceState(null, "", `#p=${idx + 1}`);
    [idx - 1, idx + 1].forEach((j) => { if (list[j]) { const i = new Image(); i.src = list[j].dataset.full; } });
  }

  function open(a) {
    if (!box) build();
    list = items();
    idx = Math.max(0, list.indexOf(a));
    lastFocus = document.activeElement;
    document.documentElement.classList.add("lb-open");
    box.classList.add("on");
    show();
    box.querySelector(".lb-close").focus();
  }

  function close() {
    box.classList.remove("on");
    document.documentElement.classList.remove("lb-open");
    history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus) lastFocus.focus();
  }

  function go(d) {
    const j = idx + d;
    if (j < 0 || j >= list.length) return;
    idx = j;
    show();
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-lb]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(a);
  });
  document.addEventListener("keydown", (e) => {
    if (!box || !box.classList.contains("on")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  });
  // 支持 #p=3 直接打开第 3 张
  window.addEventListener("load", () => {
    const m = location.hash.match(/^#p=(\d+)$/);
    if (m) { const l = items(); const a = l[+m[1] - 1]; if (a) open(a); }
  });
})();
