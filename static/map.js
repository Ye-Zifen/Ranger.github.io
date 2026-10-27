// 地图。坐标一律是 WGS-84；用高德瓦片时自动转成 GCJ-02 显示（需要先加载 coord.js）。
// map_tiles: amap（高德，国内快）/ osm / esri（卫星）
function tileLayer(kind) {
  if (kind === "osm") {
    return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" });
  }
  if (kind === "esri") {
    return L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 18, attribution: "© Esri" });
  }
  if (kind === "amap-sat") {
    return L.tileLayer("https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      { subdomains: "1234", maxZoom: 18, attribution: "© 高德地图" });
  }
  return L.tileLayer("https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    { subdomains: "1234", maxZoom: 18, attribution: "© 高德地图" });
}
const isGcjTiles = (kind) => !kind || kind.startsWith("amap");
function toView(lat, lng, kind) { return isGcjTiles(kind) && window.Coord ? Coord.wgs2gcj(lat, lng) : [lat, lng]; }

function siteMap(id, places, opts) {
  opts = opts || {};
  const el = document.getElementById(id);
  if (!el) return;
  if (!window.L) { el.textContent = "地图脚本没有加载。"; return; }
  if (!places.length && !(opts.route && opts.route.length)) {
    el.classList.add("map-empty");
    el.textContent = "还没有带坐标的地点。";
    return;
  }
  const kind = window.MAP_TILES || "amap";
  const map = L.map(el, { scrollWheelZoom: false, worldCopyJump: true });
  tileLayer(kind).addTo(map);
  const accent = "#ece8e1";
  const R = opts.R || "";
  const pts = [];
  const v = (p) => toView(p.lat, p.lng, kind);
  if (opts.route && opts.route.length > 1) {
    L.polyline(opts.route.map(v), { color: accent, weight: 2, dashArray: "4 6", opacity: .8 }).addTo(map);
  }
  (opts.route || []).forEach((p, i) => {
    pts.push(v(p));
    L.circleMarker(v(p), { radius: 6, color: "#0c0d0e", weight: 2, fillColor: accent, fillOpacity: 1 })
      .bindTooltip(`${i + 1}. ${p.name}`).on("click", () => { location.href = R + p.url; }).addTo(map);
  });
  places.forEach((p) => {
    pts.push(v(p));
    const r = Math.min(13, 5 + Math.sqrt(p.n) * 1.6);
    const m = L.circleMarker(v(p), { radius: r, color: "#0c0d0e", weight: 2, fillColor: accent, fillOpacity: .9 });
    const html = `<a class="map-pop" href="${R}${p.url}">${p.thumb ? `<img src="${R}${p.thumb}" alt="">` : ""}<strong>${p.name}</strong><span>${p.n} 张</span>${p.area ? `<em>${p.area}</em>` : ""}</a>`;
    m.bindPopup(html, { closeButton: false }).addTo(map);
  });
  if (pts.length === 1) map.setView(pts[0], opts.zoom || 9);
  else map.fitBounds(pts, { padding: [30, 30], maxZoom: 11 });
  el.addEventListener("click", () => map.scrollWheelZoom.enable(), { once: true });
  return map;
}
