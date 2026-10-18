import { db, esc, mmss, status, statusKey, mark, cityShort, cityName, provName, shopDishes, hasPoint, point, priceFull, spice, dots, shopHref, cityHref, out, yt } from '../core.js';
import { amapURL, dianpingURL, ext, copy, toast } from '../links.js';
import { iframe, videoLinks } from '../ui.js';
import { goto } from '../nav.js';
import { makeMap } from '../geo.js';
import { icon } from '../icons.js';
import { shopRow } from './shops.js';

const RADIUS = 500; // metres: coordinates are public listings, datum unverified

export default function shopView(params, rawId) {
  let id = rawId;
  try { id = decodeURIComponent(rawId); } catch { /* keep raw */ }
  const s = db.shop[id];
  if (!s) {
    return { name: 'shop', tab: 'shops', title: '没找到这家店', html: `<div class="wrap pad"><h1 class="h1">还没有这家店的资料</h1><p><a href="#/shops">回到找店铺 →</a></p></div>` };
  }
  const ds = shopDishes(s);
  const timed = ds.filter((d) => d.video && Number.isFinite(d.t)).sort((a, b) => a.t - b.t);
  const vid = timed[0]?.video || (s.videos || []).find((v) => db.video[v]);
  const start = timed.find((d) => d.video === vid)?.t || 0;
  const bvs = [...new Set([...(s.bvids || []), ...(db.D.bilibili || []).filter((b) => (b.shops || []).includes(s.id)).map((b) => b.bvid)])].map((b) => db.bili[b] || { bvid: b, url: `https://www.bilibili.com/video/${b}/`, title: 'B站原视频' });
  const amap = amapURL(s.map_url), dp = dianpingURL(s.dianping_url);
  const amapLabel = s.map_scope === 'region' ? '高德搜这一带' : '高德地图';
  const peers = (db.shopsByCity[s.city] || []).filter((x) => x.id !== s.id).slice(0, 4);
  const title = s.name.match(/^([^（]+)(（.*）)$/);
  const located = hasPoint(s);
  const voices = s.comment_voices || [];

  const actions = (cls) => `<div class="${cls}">
    ${amap ? ext(amap, `${icon.nav}<span>${amapLabel}<small>新页面打开</small></span>`, 'act act-primary') : '<span class="act act-off">高德<small>没有链接</small></span>'}
    ${dp ? ext(dp, `${icon.star}<span>大众点评<small>新页面打开</small></span>`, 'act') : ''}
    ${vid ? `<a class="act" href="#watch" data-jump="watch">${icon.film}<span>看原片<small>${mmss(start)}</small></span></a>` : ''}
  </div>`;

  const dishCard = (d) => `<article class="dish-card">
    <div class="dish-card-head"><h3 class="h3">${esc(d.zh)}</h3><span class="price-line">${priceFull(d)}</span></div>
    <div class="facts">${spice(d.spice)}<span class="score" aria-label="主播评分 ${d.score}/5">主播评分 ${dots(d.score)}</span></div>
    <p>${esc(d.verdict_zh)}</p>
    ${d.quote_zh ? `<button type="button" class="quote-btn" data-seek="${esc(d.video)}" data-t="${d.t}">
      ${icon.play}<span><span>“${esc(d.quote_zh)}”</span><small>主播 · 视频 ${mmss(d.t)}</small></span></button>` : ''}
    <button type="button" class="link-btn" data-dish="${esc(d.id)}">这道菜是什么 →</button>
  </article>`;

  return {
    name: 'shop', tab: 'shops', title: s.name,
    html: `<div class="crumbs wrap">
      <a href="#/shops?city=${esc(s.city)}" data-back class="back">${icon.back}<span>${esc(cityShort(s.city))} · ${(db.shopsByCity[s.city] || []).length} 家</span></a>
      <button type="button" class="icon-btn" data-share aria-label="分享这家店">${icon.share}</button>
    </div>
    <div class="wrap shop-layout">
      <div class="shop-main">
        <header class="shop-head o-head">
          <p class="kicker" data-prov="${esc(s.province)}">${esc(provName(s.province))} · <a href="${cityHref(s.city)}">${esc(cityName(s.city))}</a></p>
          <h1 class="h1 shop-name">${title ? `${esc(title[1])}<small>${esc(title[2])}</small>` : esc(s.name)}</h1>
          <p class="status-pill" data-status="${statusKey(s)}">${mark(statusKey(s))}${status(s).label}${s.checked ? ` · ${esc(s.checked)} 核对` : ''}</p>
        </header>

        ${vid ? `<section id="watch" class="watch o-watch" data-inline-player>
          <div class="player" data-player>
            <button type="button" class="poster" data-poster aria-label="播放原片，从 ${mmss(start)} 开始">
              <img src="${esc(yt(vid, 'hqdefault'))}" alt="" data-fallback="原片画面">
              <span class="play-pill">${icon.play} 看原片 · ${mmss(start)}</span>
            </button>
          </div>
          ${timed.length > 1 ? `<div class="chapters" aria-label="跳到这一段">${timed.map((d) => `<button type="button" class="chip" data-seek="${esc(d.video)}" data-t="${d.t}">▶ ${mmss(d.t)} ${esc(d.zh)}</button>`).join('')}</div>` : ''}
          <div data-video-links>${videoLinks(vid, start)}</div>
        </section>` : ''}

        <section class="block o-dishes">
          <h2 class="h2">到店吃什么</h2>
          ${ds.length ? ds.map(dishCard).join('') : '<p class="muted">这家店没有主播逐道评分的菜，先看原片和下面的评论。</p>'}
          ${(s.menu_notes || []).length ? `<ul class="notes-list">${s.menu_notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        </section>

        <section class="block o-voices">
          <h2 class="h2">评论怎么说</h2>
          ${(s.comment_summary || []).length ? `<ul class="summary">${s.comment_summary.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          ${voices.length ? voices.map((c) => `<blockquote class="voice">
              <p>“${esc(c.text)}”</p>
              <footer>${esc(c.author)}${c.date ? ' · ' + esc(c.date) : ''} · ${out(c.url, c.url_precision === 'reply' ? 'B站原评论' : 'B站评论区')}</footer>
              ${c.context ? `<small class="muted">${esc(c.context)}</small>` : ''}
            </blockquote>`).join('')
          : `<p class="muted">${esc(s.comment_voices_missing_reason || '暂时没有能逐字核对的评论原文。')}</p>`}
          ${bvs.length ? `<div class="bili-links"><span class="label">B站原视频</span>${bvs.map((b) => out(b.url, b.title)).join('')}</div>` : ''}
          <details class="sources">
            <summary>资料来源（${(s.sources || []).length} 条）</summary>
            <ul>${(s.sources || []).map((x) => `<li>${out(x.url, x.author || '来源')}${x.date ? ` <span class="muted">${esc(x.date)}</span>` : ''}<p>${esc(x.note || '')}</p></li>`).join('')}</ul>
          </details>
        </section>

        ${peers.length ? `<section class="block o-peers">
          <div class="sec-head"><h2 class="h2">${esc(cityShort(s.city))}还有</h2><a href="#/shops?city=${esc(s.city)}">全部 ${(db.shopsByCity[s.city] || []).length} 家 →</a></div>
          <ul class="shop-list">${peers.map(shopRow).join('')}</ul>
        </section>` : ''}
      </div>
      <aside class="shop-side">
        <section class="card addr-card o-addr" aria-labelledby="addr-h">
          <h2 id="addr-h" class="label">地址</h2>
          <p class="addr">${esc(s.address || '具体地址待核实')}</p>
          ${s.relative_location ? `<p class="muted">${esc(s.relative_location)}</p>` : ''}
          ${s.caveat ? `<p class="note-box">${esc(s.caveat)}</p>` : ''}
          <div class="btn-row">
            <button type="button" class="btn" data-copy="${esc(s.address || '')}">${icon.copy} 复制地址</button>
            <button type="button" class="btn" data-copy="${esc(s.name.replace(/（.*）$/, ''))}">${icon.copy} 复制店名</button>
          </div>
        </section>

        <section class="block where-block o-where">
          <h2 class="h2">在哪儿</h2>
          ${located ? `<div class="mini-map" data-mini-map aria-label="${esc(s.name)}附近街区地图">
              <span class="map-tag">圈里是附近街区，不是门口</span>
              <a class="map-open" href="#/map?city=${esc(s.city)}&amp;shop=${esc(s.id)}">${icon.expand} 大地图</a>
            </div>
            <p class="muted fine">${esc(s.location.note || '坐标来自公开餐馆资料，只画范围。导航请用高德，按店名核对。')}</p>`
          : `<div class="no-map">
              <p><strong>这家还没有可靠坐标，地图上不画点。</strong></p>
              <p class="muted">用上面的地址，或者点“${esc(amapLabel)}”按店名搜索。</p>
              <a href="#/map?city=${esc(s.city)}">在地图上看${esc(cityShort(s.city))}的其他店 →</a>
            </div>`}
          ${actions('actions-inline')}
        </section>

      </aside>
    </div>
    ${actions('actionbar')}`,

    mount(root) {
      let mapCtl = null, alive = true;
      const player = root.querySelector('[data-player]');
      const play = (v, t) => {
        if (!player) return;
        player.innerHTML = iframe(v, t, true);
        const links = root.querySelector('[data-video-links]');
        if (links) links.innerHTML = videoLinks(v, t);
        root.querySelector('#watch').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      };
      root.addEventListener('click', async (e) => {
        if (e.target.closest('[data-poster]')) { play(vid, start); return; }
        const seek = e.target.closest('[data-seek]');
        if (seek) { play(seek.dataset.seek, Number(seek.dataset.t)); return; }
        const jump = e.target.closest('[data-jump]');
        if (jump) { e.preventDefault(); root.querySelector('#' + jump.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
        const c = e.target.closest('[data-copy]');
        if (c) { toast((await copy(c.dataset.copy)) ? '已复制：' + c.dataset.copy : '复制不了，请长按文字手动复制'); return; }
        if (e.target.closest('[data-share]')) {
          const url = location.href.split('#')[0] + shopHref(s);
          try {
            if (!navigator.share) throw new Error('no share');
            await navigator.share({ title: s.name + ' · 红油地图', url });
          } catch (err) {
            if (err?.name !== 'AbortError') toast((await copy(url)) ? '链接已复制' : url); // cancelled sheets stay quiet
          }
        }
      });
      const el = root.querySelector('[data-mini-map]');
      if (el) {
        const io = new IntersectionObserver(async (entries) => {
          if (!entries.some((x) => x.isIntersecting)) return;
          io.disconnect();
          // drag-to-pan only with a mouse; on touch screens the preview stays still and opens the full map
          const desktop = matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches;
          try {
            mapCtl = await makeMap(el, {
              interactive: desktop, zoomControl: desktop, wheel: false,
              onTilesFailed() { el.insertAdjacentHTML('beforeend', '<p class="map-fail">道路底图加载不了，圈出的是大概范围。</p>'); },
              draw({ L, layer, ll, fit }) {
                const others = (db.shopsByCity[s.city] || []).filter((x) => x.id !== s.id && hasPoint(x));
                for (const o of others) {
                  L.circle(ll(...point(o)), { radius: RADIUS, className: 'area area-dim', interactive: false }).addTo(layer);
                }
                L.circle(ll(...point(s)), { radius: RADIUS, className: 'area area-on', interactive: false }).addTo(layer);
                fit([point(s)], 14);
              }
            });
            if (!alive) { mapCtl.destroy(); return; }
            // On phones the preview stays still (no scroll trap); tapping it opens the full map.
            if (!desktop) el.addEventListener('click', (ev) => { if (!ev.target.closest('a')) goto(el.querySelector('.map-open').getAttribute('href')); });
          } catch {
            el.classList.add('map-failed');
            el.insertAdjacentHTML('beforeend', '<p class="map-fail">地图加载不了。地址在上面，可以直接复制或用高德搜索。</p>');
          }
        }, { rootMargin: '200px' });
        io.observe(el);
        return () => { alive = false; io.disconnect(); mapCtl?.destroy(); };
      }
      return null;
    }
  };
}
