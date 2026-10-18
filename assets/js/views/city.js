import { db, esc, mmss, realCities, dishCount, seal, cityShort, cityName, provName, cityHref, price, isPseudoCity, yt } from '../core.js';
import { shopRow } from './shops.js';

export default function cityView(params, rawId) {
  let id = rawId;
  try { id = decodeURIComponent(rawId); } catch { /* keep raw */ }
  const c = db.city[id];
  if (!c) return { name: 'city', tab: 'cities', title: '城市', html: '<div class="wrap pad"><h1 class="h1">没有这座城市</h1><p><a href="#/cities">回到城市列表 →</a></p></div>' };
  const shops = db.shopsByCity[c.id] || [];
  const must = (c.must_eat || []).map((x) => db.dish[x]).filter(Boolean);
  const dishes = db.D.dishes.filter((d) => d.city === c.id && !(c.must_eat || []).includes(d.id)).sort((a, b) => b.score - a.score);
  const quotes = (c.impressions || []).filter((q) => q.quote_zh);
  const vids = (c.videos || []).map((v) => db.video[v]).filter(Boolean);
  const tabs = [...realCities(), ...db.D.cities.filter((x) => isPseudoCity(x.id))];

  return {
    name: 'city', tab: 'cities', title: cityName(c.id),
    html: `<nav class="city-tabs" aria-label="切换城市"><div class="city-tabs-in">${tabs.map((x) => `<a href="${cityHref(x.id)}" ${x.id === c.id ? 'aria-current="page"' : ''}>${esc(cityShort(x.id))}</a>`).join('')}</div></nav>
    <div class="wrap page-pad city-page">
      <header class="city-head">
        ${seal(c.id, 'seal seal-lg')}
        <div><p class="kicker" data-prov="${esc(c.province)}">${esc(provName(c.province))}</p>
        <h1 class="h1">${esc(c.vibe_tags?.[0]?.zh || cityShort(c.id))}</h1>
        ${(c.vibe_tags || []).length > 1 ? `<p class="muted">${c.vibe_tags.slice(1).map((t) => esc(t.zh)).join(' · ')}</p>` : ''}</div>
      </header>
      <p class="verdict-lg">${esc(c.verdict_zh)}</p>
      <dl class="stats">
        <div><dt>家店</dt><dd>${shops.length}</dd></div>
        <div><dt>道已评菜</dt><dd>${dishCount(c.id)}</dd></div>
        <div><dt>一顿约</dt><dd>${c.typical_meal_cny ? '¥' + c.typical_meal_cny : '—'}</dd></div>
        <div><dt>辣度</dt><dd class="hot">${c.spice?.la ?? 0}/5</dd></div>
      </dl>

      ${quotes.length ? `<section class="block">
        <h2 class="h2">他们怎么说</h2>
        <div class="quote-rail" tabindex="0" aria-label="原话，可左右滑动">${quotes.map((q) => `<figure class="quote-card">
          <blockquote>“${esc(q.quote_zh)}”</blockquote>
          <figcaption><span>${esc(q.speaker_zh || '')}</span>${q.video ? `<button type="button" class="link-btn light" data-play="${esc(q.video)}" data-t="${q.t}" data-quote="${esc(q.quote_zh)}" data-who="${esc(q.speaker_zh || '')}">▶ 看这一段 ${mmss(q.t)}</button>` : ''}</figcaption>
        </figure>`).join('')}</div>
      </section>` : ''}

      ${must.length || dishes.length ? `<section class="block">
        <div class="sec-head"><h2 class="h2">${must.length ? '必吃' : '吃过的菜'}</h2><a href="#/menu?city=${esc(c.id)}">在菜单里看 →</a></div>
        <ol class="rank-list">${[...must, ...(must.length ? [] : dishes)].map((d, i) => `<li><button type="button" data-dish="${esc(d.id)}">
          <span class="rank">${i + 1}</span>
          <span><strong>${esc(d.zh)}</strong><span class="muted">${[price(d), '辣 ' + d.spice.la + '/5', d.quote_zh ? '“' + esc(d.quote_zh) + '”' : ''].filter(Boolean).join(' · ')}</span></span>
        </button></li>`).join('')}</ol>
        ${must.length && dishes.length ? `<details class="more"><summary>还有 ${dishes.length} 道</summary><ul class="plain-list">${dishes.map((d) => `<li><button type="button" class="link-btn" data-dish="${esc(d.id)}">${esc(d.zh)}${price(d) ? ' · ' + price(d) : ''}</button></li>`).join('')}</ul></details>` : ''}
      </section>` : ''}

      ${shops.length ? `<section class="block">
        <div class="sec-head"><h2 class="h2">去这些店</h2><a href="#/shops?city=${esc(c.id)}">全部 ${shops.length} 家 →</a></div>
        <ul class="shop-list">${shops.slice(0, 5).map(shopRow).join('')}</ul>
        <p><a href="#/map?city=${esc(c.id)}">在地图上看 →</a></p>
      </section>` : ''}

      ${(c.tips || []).length ? `<section class="block">
        <h2 class="h2">出发前知道</h2>
        <ul class="tip-list">${c.tips.map((t) => `<li><p>${esc(t.zh)}</p>${t.video ? `<button type="button" class="link-btn" data-play="${esc(t.video)}" data-t="${t.t}" data-quote="${esc(t.zh)}">▶ ${mmss(t.t)}</button>` : ''}</li>`).join('')}</ul>
      </section>` : ''}

      ${vids.length ? `<section class="block">
        <h2 class="h2">在这里拍的视频</h2>
        <ul class="video-list">${vids.map((v) => `<li><button type="button" class="video-row" data-play="${esc(v.id)}" data-t="0">
          <span class="thumb thumb-video"><img src="${esc(yt(v.id, 'mqdefault'))}" alt="" loading="lazy" data-fallback="视频"></span>
          <span><strong>${esc(v.title_zh)}</strong><span class="muted">${esc(v.upload_date || '')} · ${mmss(v.duration)}</span></span>
        </button></li>`).join('')}</ul>
      </section>` : ''}
    </div>`,
    mount(root) {
      // centre the current city's tab without scrolling the page itself
      const tabs = root.querySelector('.city-tabs-in'), on = tabs?.querySelector('[aria-current]');
      if (on) {
        const a = tabs.getBoundingClientRect(), b = on.getBoundingClientRect();
        tabs.scrollLeft += b.left - a.left - (a.width - b.width) / 2;
      }
    }
  };
}
