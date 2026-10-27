// 坐标系转换：网站里所有坐标都存 WGS-84（GPS / 谷歌地球 / 维基百科用的坐标）。
// 高德地图在中国境内用 GCJ-02（有几百米偏移），所以在高德瓦片上显示时要转换。
(function (g) {
  const A = 6378245.0, EE = 0.00669342162296594323;
  const outOfChina = (lat, lng) => lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  function tLat(x, y) {
    let r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
    return r;
  }
  function tLng(x, y) {
    let r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
    return r;
  }
  function wgs2gcj(lat, lng) {
    if (outOfChina(lat, lng)) return [lat, lng];
    let dLat = tLat(lng - 105, lat - 35), dLng = tLng(lng - 105, lat - 35);
    const rad = lat / 180 * Math.PI;
    let m = Math.sin(rad); m = 1 - EE * m * m;
    const sm = Math.sqrt(m);
    dLat = (dLat * 180) / ((A * (1 - EE)) / (m * sm) * Math.PI);
    dLng = (dLng * 180) / (A / sm * Math.cos(rad) * Math.PI);
    return [lat + dLat, lng + dLng];
  }
  function gcj2wgs(lat, lng) {
    // 迭代求逆，误差 < 1 米
    let wLat = lat, wLng = lng;
    for (let i = 0; i < 6; i++) {
      const [gl, gn] = wgs2gcj(wLat, wLng);
      wLat += lat - gl; wLng += lng - gn;
    }
    return [wLat, wLng];
  }
  g.Coord = { wgs2gcj, gcj2wgs, outOfChina };
})(window);
