// 全部照片：同一组内多选取并集，不同组之间取交集
(function () {
  const tiles = [...document.querySelectorAll(".grid .tile")];
  const groups = [...document.querySelectorAll(".filter-group")];
  const clear = document.getElementById("filter-clear");
  const countEl = document.getElementById("archive-count");
  const empty = document.getElementById("filter-empty");
  const total = tiles.length;

  function apply() {
    const active = groups.map((g) => ({
      key: g.dataset.key,
      values: [...g.querySelectorAll("button[aria-pressed=true]")].map((b) => b.dataset.value),
    })).filter((g) => g.values.length);
    let n = 0;
    for (const t of tiles) {
      const ok = active.every((g) => g.values.includes(t.getAttribute("data-f-" + g.key)));
      t.hidden = !ok;
      if (ok) n++;
    }
    clear.hidden = !active.length;
    empty.hidden = n > 0;
    countEl.textContent = active.length
      ? `显示 ${n} 张（共 ${total} 张）`
      : `共 ${total} 张，按拍摄时间从新到旧。`;
  }

  groups.forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    apply();
  }));
  clear.addEventListener("click", () => {
    document.querySelectorAll(".filter-group button").forEach((b) => b.setAttribute("aria-pressed", "false"));
    apply();
  });
})();
