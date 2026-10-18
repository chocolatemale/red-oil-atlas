import { db, esc, realCities, dishCount, seal, dots, cityShort, cityHref, provName, isPseudoCity } from '../core.js';

export function cityTile(c) {
  const n = (db.shopsByCity[c.id] || []).length;
  return `<a class="city-tile" href="${cityHref(c.id)}">
    ${seal(c.id)}
    <span class="city-tile-text">
      <strong>${esc(cityShort(c.id))}<span class="muted"> · ${esc(c.vibe_tags?.[0]?.zh || '')}</span></strong>
      <span class="muted">${n ? n + ' 家店 · ' : ''}${dishCount(c.id)} 道菜${c.typical_meal_cny ? ` · 一顿约 ¥${c.typical_meal_cny}` : ''}</span>
      <span class="heat-line">辣 ${dots(c.spice?.la || 0)}</span>
    </span>
  </a>`;
}

export default function citiesView() {
  const groups = ['guizhou', 'yunnan'].map((p) => ({ p, list: realCities(p) }));
  const others = db.D.cities.filter((c) => isPseudoCity(c.id));
  return {
    name: 'cities', tab: 'cities', title: '城市',
    html: `<div class="wrap page-pad">
      <h1 class="h1">城市</h1>
      <p class="muted sec-sub">每座城一页：主播的总评、原话、必吃和店。</p>
      ${groups.map(({ p, list }) => `<section class="block">
        <h2 class="h2" data-prov="${p}">${esc(provName(p))}<span class="muted"> · ${list.length} 个地方</span></h2>
        <div class="tile-grid">${list.map(cityTile).join('')}</div>
      </section>`).join('')}
      ${others.length ? `<section class="block"><h2 class="h2">零散的地方</h2><div class="tile-grid">${others.map(cityTile).join('')}</div></section>` : ''}
      <p class="note-box">重庆、四川、西藏还没逐期整理，没有评分。<a href="#/videos">在视频页看这 ${db.D.pending.length} 期清单 →</a></p>
    </div>`
  };
}
