import { db, esc, shops, sortShops, status, statusKey, realCities, cityShort, cityName, provName, hasPoint, point, shopHref, cityHref, isPseudoCity } from '../core.js';
import { amapURL, ext } from '../links.js';
import { makeMap } from '../geo.js';
import { setParams } from '../main.js';
import { icon } from '../icons.js';

const RADIUS = 500;

export default function mapView(params) {
  const st = { p: params.get('p') || 'all', city: params.get('city') || '', shop: params.get('shop') || '', open: params.get('open') === '1' };
  if (st.city && !db.city[st.city]) st.city = '';
  if (st.city) st.p = db.city[st.city].province;

  return {
    name: 'map', tab: 'map', title: '地图',
    html: `<div class="map-page">
      <div class="map-canvas" data-map role="application" aria-label="西南美食地图，可拖动缩放"></div>
      <div class="map-top">
        <div class="seg seg-float" role="group" aria-label="省份" data-seg="p">
          <button type="button" data-v="all">全部</button><button type="button" data-v="guizhou">贵州</button><button type="button" data-v="yunnan">云南</button>
        </div>
      </div>
      <p class="map-msg" data-msg hidden></p>
      <section class="map-panel" data-panel aria-live="polite">
        <button type="button" class="panel-handle" data-toggle aria-label="展开或收起列表"><span></span></button>
        <div class="panel-body" data-body></div>
      </section>
    </div>`,
    mount(root) {
      let ctl = null, alive = true;
      const panel = root.querySelector('[data-panel]'), body = root.querySelector('[data-body]');
      const pins = {}, areas = {};

      const cityList = () => {
        const list = realCities(st.p).filter((c) => (db.shopsByCity[c.id] || []).length);
        const pseudo = db.D.cities.filter((c) => isPseudoCity(c.id) && (st.p === 'all' || c.province === st.p) && (db.shopsByCity[c.id] || []).length);
        body.innerHTML = `<div class="panel-head"><h2 class="h2">${st.p === 'all' ? '贵州和云南' : esc(provName(st.p))}</h2><span class="muted">${shops().filter((s) => st.p === 'all' || s.province === st.p).length} 家</span></div>
          <p class="muted fine">点地图上的城市，或者从这里选。</p>
          <ul class="city-pick">${[...list, ...pseudo].map((c) => `<li><button type="button" data-city="${esc(c.id)}"><span>${esc(cityShort(c.id))}</span><span class="muted">${(db.shopsByCity[c.id] || []).length} 家 · ${(db.shopsByCity[c.id] || []).filter(hasPoint).length ? '有街区坐标' : '只知道城市'}</span>${icon.chevron}</button></li>`).join('')}</ul>`;
      };

      const shopItem = (s) => {
        const amap = amapURL(s.map_url);
        return `<li class="${s.id === st.shop ? 'on' : ''}" data-shop-li="${esc(s.id)}">
          <a class="pick-shop" href="${shopHref(s)}"><strong>${esc(s.name)}</strong>
          <span class="row-status" data-status="${statusKey(s)}"><span aria-hidden="true">${status(s).mark}</span> ${hasPoint(s) ? '有街区坐标 · ' : ''}${status(s).short}</span></a>
          ${amap ? ext(amap, '高德 <span aria-hidden="true">↗</span>', 'btn btn-soft btn-sm') : ''}
        </li>`;
      };

      const cityPanel = () => {
        const c = db.city[st.city], list = sortShops([...(db.shopsByCity[st.city] || [])]);
        const located = list.filter(hasPoint);
        body.innerHTML = `<div class="panel-head">
            <button type="button" class="icon-btn" data-up aria-label="回到城市列表">${icon.back}</button>
            <h2 class="h2">${esc(cityShort(st.city))} · ${list.length} 家</h2>
            <a href="${cityHref(st.city)}">城市总评 →</a></div>
          <p class="muted fine">${located.length ? `${located.length} 家有公开坐标，画成范围圈（约 ${RADIUS} 米），不是门口。` : ''}其余 ${list.length - located.length} 家只知道在${esc(cityShort(st.city))}，地图上不画点，点“高德”按店名搜。</p>
          <ul class="pick-list">${list.map(shopItem).join('')}</ul>`;
        if (c && !isPseudoCity(c.id)) {
          if (located.length) ctl?.fit(located.map(point).concat(located.length === 1 ? [[c.lat, c.lon]] : []), 14, [48, 48]);
          else ctl?.fit([[c.lat, c.lon]], 11);
        }
      };

      const draw = () => {
        root.querySelectorAll('[data-seg="p"] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === st.p)));
        Object.entries(pins).forEach(([id, m]) => m.getElement()?.classList.toggle('on', id === st.city));
        Object.entries(areas).forEach(([id, a]) => a.getElement?.()?.classList.toggle('area-on', id === st.shop));
        if (st.city) cityPanel(); else cityList();
        setParams({ p: st.p === 'all' || st.city ? '' : st.p, city: st.city, shop: st.shop, open: '' });
      };

      const fitProvince = () => {
        const cs = realCities(st.p).filter((c) => (db.shopsByCity[c.id] || []).length);
        ctl?.fit(cs.map((c) => [c.lat, c.lon]), 9, [40, 40]);
      };

      root.addEventListener('click', (e) => {
        const seg = e.target.closest('[data-seg="p"] button');
        if (seg) { st.p = seg.dataset.v; st.city = ''; st.shop = ''; draw(); fitProvince(); return; }
        const city = e.target.closest('[data-city]');
        if (city) { st.city = city.dataset.city; st.shop = ''; draw(); panel.classList.add('open'); return; }
        if (e.target.closest('[data-up]')) { st.city = ''; st.shop = ''; draw(); fitProvince(); return; }
        if (e.target.closest('[data-toggle]')) panel.classList.toggle('open');
      });

      (async () => {
        try {
          ctl = await makeMap(root.querySelector('[data-map]'), {
            interactive: true, zoomControl: true,
            onTilesFailed() {
              const m = root.querySelector('[data-msg]');
              m.hidden = false; m.textContent = '道路底图加载不了，先显示省界和城市位置。';
            },
            draw({ L, layer, ll }) {
              for (const c of realCities()) {
                const n = (db.shopsByCity[c.id] || []).length;
                if (!n) continue;
                const m = L.marker(ll(c.lat, c.lon), {
                  icon: L.divIcon({ className: 'pin-wrap', html: `<span class="pin" data-prov="${c.province}"><b>${n}</b>${esc(cityShort(c.id))}</span>`, iconSize: null, iconAnchor: [0, 0] }),
                  title: `${cityName(c.id)}，${n} 家店`, keyboard: true, riseOnHover: true
                }).addTo(layer);
                m.on('click', () => { st.city = c.id; st.shop = ''; draw(); panel.classList.add('open'); });
                pins[c.id] = m;
              }
              for (const s of shops().filter(hasPoint)) {
                const a = L.circle(ll(...point(s)), { radius: RADIUS, className: 'area' + (s.id === st.shop ? ' area-on' : '') }).addTo(layer);
                a.bindTooltip(esc(s.name), { direction: 'top', className: 'area-tip' });
                a.on('click', () => {
                  st.city = s.city; st.shop = s.id; draw(); panel.classList.add('open');
                  body.querySelector(`[data-shop-li="${CSS.escape(s.id)}"]`)?.scrollIntoView({ block: 'nearest' });
                });
                areas[s.id] = a;
              }
            }
          });
          if (!alive) { ctl.destroy(); return; }
          if (st.shop && db.shop[st.shop] && hasPoint(db.shop[st.shop])) { draw(); ctl.fit([point(db.shop[st.shop])], 15); }
          else if (st.city) draw();
          else fitProvince();
          if (st.city || st.shop) panel.classList.add('open');
        } catch {
          const m = root.querySelector('[data-msg]');
          m.hidden = false; m.textContent = '地图组件加载不了，下面的列表仍然可以用。';
          panel.classList.add('open');
        }
      })();
      draw();
      return () => { alive = false; ctl?.destroy(); };
    }
  };
}
