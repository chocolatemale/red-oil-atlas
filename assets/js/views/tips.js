import { db, esc, mmss, realCities, cityShort, cityHref, dishCount, FX, legend, scrollBehavior } from '../core.js';

export default function tipsView() {
  const D = db.D;
  const cities = [...realCities(), ...D.cities.filter((c) => !realCities().includes(c))].filter((c) => (c.tips || []).length);
  return {
    name: 'tips', tab: 'tips', title: '贴士',
    html: `<div class="wrap page-pad">
      <h1 class="h1">出发前</h1>
      <p class="muted sec-sub">主播们在镜头前踩过的坑和学到的经验。</p>
      <div class="key-grid">
        <section class="card"><h2 class="h3">怎么看辣度</h2>
          <p><b>麻</b>是花椒的麻，<b>辣</b>是辣椒的辣，都按主播在镜头前的反应打 0–5 分。当地人说“不辣”的时候，请自己加两级。不能吃辣要提前跟老板说。</p></section>
        <section class="card"><h2 class="h3">价格</h2>
          <p>价格都是拍摄当时的，可能已经涨了。C$ 是加元，按 1 元人民币约 ${FX} 加元换算。</p></section>
        <section class="card"><h2 class="h3">店址</h2>
          <p class="legend">${legend()}</p><p>建档不等于今天还在营业，出发前用高德或点评再核对一次。</p></section>
      </div>
      <nav class="pill-row jump-row" aria-label="跳到城市">${cities.map((c) => `<a class="pill" href="#tips-${esc(c.id)}" data-jump-to="tips-${esc(c.id)}">${esc(cityShort(c.id))}</a>`).join('')}</nav>
      ${cities.map((c) => `<section class="block" id="tips-${esc(c.id)}">
        <div class="sec-head"><h2 class="h2">${esc(cityShort(c.id))}</h2><a href="${cityHref(c.id)}">${dishCount(c.id)} 道菜 · 城市页 →</a></div>
        <ul class="tip-list">${c.tips.map((t) => `<li><p>${esc(t.zh)}</p>${t.video ? `<button type="button" class="link-btn" data-play="${esc(t.video)}" data-t="${t.t}">▶ 看这一段 ${mmss(t.t)}</button>` : ''}</li>`).join('')}</ul>
      </section>`).join('')}
      ${(D.non_public_food || []).length ? `<section class="block"><h2 class="h2">这些不是餐馆</h2>
        <p class="muted sec-sub">视频里吃到了，但不是对外营业的地方，所以不给导航。</p>
        <ul class="tip-list">${D.non_public_food.map((x) => `<li><p><strong>${esc(x.name)}</strong></p><p class="muted">${esc(x.reason)}</p></li>`).join('')}</ul></section>` : ''}
    </div>`,
    mount(root) {
      root.addEventListener('click', (e) => {
        const a = e.target.closest('[data-jump-to]');
        if (a) { e.preventDefault(); root.querySelector('#' + CSS.escape(a.dataset.jumpTo))?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }); }
      });
    }
  };
}
