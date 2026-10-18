import { db, esc, safeURL, shops, realCities, dishCount, seal, dots, cityShort, cityHref, price, thumb } from '../core.js';
import { icon } from '../icons.js';
import { goto } from '../nav.js';

const FEATURED_CITIES = ['zunyi', 'kaili', 'guiyang', 'anshun', 'kunming', 'mangshi'];

export default function home() {
  const D = db.D, all = shops();
  const gz = realCities('guizhou').filter((c) => (db.shopsByCity[c.id] || []).length);
  const yn = realCities('yunnan').filter((c) => (db.shopsByCity[c.id] || []).length);
  // one loved dish per city, Guizhou first, so the list reads like a route
  const picks = [];
  for (const id of FEATURED_CITIES) {
    const d = D.dishes.filter((x) => x.city === id && x.score === 5 && x.quote_zh).sort((a, b) => (db.shopsByDish[b.id] ? 1 : 0) - (db.shopsByDish[a.id] ? 1 : 0))[0];
    if (d) picks.push(d);
  }
  const hours = Math.round(D.videos.reduce((a, v) => a + (v.duration || 0), 0) / 3600);
  const count = (p) => all.filter((s) => s.province === p).length;

  const cityCard = (c) => {
    const n = (db.shopsByCity[c.id] || []).length;
    return `<a class="city-card" href="${cityHref(c.id)}">
      ${seal(c.id)}
      <strong>${esc(c.vibe_tags?.[0]?.zh || cityShort(c.id))}</strong>
      <span class="muted">${n} 处店摊 · ${dishCount(c.id)} 道菜</span>
      <span class="heat-line">辣 ${dots(c.spice?.la || 0)}</span>
    </a>`;
  };

  return {
    name: 'home', tab: 'home', title: '',
    html: `<section class="hero wrap">
      <div class="hero-copy">
        <p class="eyebrow">贵州优先 · ${D.videos.length} 期视频 · ${all.length} 处店摊</p>
        <h1 class="display">西南，一碗一碗<br>吃过去。</h1>
        <p class="lede">跟着<a href="${esc(safeURL(D.channel.url))}" target="_blank" rel="noopener noreferrer">盗月社</a>找店。先看主播吃了什么、说了什么，再把地址带走：一键复制，一键打开高德。</p>
        <form class="search-box" role="search" data-home-search>
          <label for="home-q" class="sr">搜索店名、菜名或城市</label>
          ${icon.search}
          <input id="home-q" name="q" type="search" placeholder="搜店名、菜名或城市，比如：羊肉粉" autocomplete="off" enterkeyhint="search">
          <button type="submit" class="btn btn-ink">搜索</button>
        </form>
      </div>
      <nav class="entries" aria-label="从这里开始">
        <a class="entry" href="#/shops">${icon.shop}<strong>找店铺</strong><span>${all.length} 处店摊，按城市筛</span></a>
        <a class="entry" href="#/map">${icon.map}<strong>地图</strong><span>看哪些店挨得近</span></a>
        <a class="entry" href="#/menu">${icon.bowl}<strong>菜单</strong><span>${D.dishes.length} 道，按辣度挑</span></a>
        <a class="entry" href="#/cities">${icon.city}<strong>城市</strong><span>${realCities().length} 个地方的总评</span></a>
      </nav>
    </section>

    <section class="band">
      <div class="wrap">
        <div class="sec-head"><h2 class="h2">先去贵州</h2><a href="#/shops?p=guizhou">贵州 ${count('guizhou')} 处店摊 →</a></div>
      </div>
      <div class="rail wrap-rail">${gz.map(cityCard).join('')}</div>
    </section>

    <section class="wrap band">
      <div class="sec-head"><h2 class="h2">主播吃完说好的</h2><a href="#/menu">整张菜单 →</a></div>
      <p class="muted sec-sub">点一道菜看介绍，再点原话跳到视频里那一秒。</p>
      <ul class="dish-rows">${picks.map((d) => `<li><button type="button" class="dish-row" data-dish="${esc(d.id)}">
        ${thumb(d.img?.replace(/(sd|maxres)default\.jpg$/, 'hqdefault.jpg'), d.zh)}
        <span class="dish-row-text"><strong>${esc(d.zh)}</strong>
        <span class="muted">${esc(cityShort(d.city))}${price(d) ? ' · ' + price(d) : ''}</span>
        <span class="quote-line">“${esc(d.quote_zh)}”</span></span>
        ${icon.chevron}</button></li>`).join('')}</ul>
    </section>

    <section class="wrap band">
      <div class="sec-head"><h2 class="h2">云南也收了</h2><a href="#/shops?p=yunnan">云南 ${count('yunnan')} 处店摊 →</a></div>
      <div class="pill-row">${yn.map((c) => `<a class="pill pill-yn" href="${cityHref(c.id)}">${esc(cityShort(c.id))} <b>${(db.shopsByCity[c.id] || []).length}</b></a>`).join('')}</div>
      <p class="muted fine">重庆、四川、西藏的 ${D.pending.filter((v) => ['chongqing', 'sichuan', 'tibet'].includes(v.province)).length} 期还没整理，<a href="#/videos">在视频页看清单</a>。</p>
    </section>

    <section class="wrap band">
      <div class="tip-card">
        <span class="tip-ic">${icon.tip}</span>
        <div><strong>出发前看一眼</strong>
        <p>本地人说的“不辣”已经很辣；遵义机场不让随身带辣椒酱，要托运。价格都是拍摄当时的。</p>
        <a href="#/tips">全部贴士 →</a></div>
      </div>
    </section>

    <footer class="foot wrap">
      <p>所有画面、原话版权归<a href="${esc(safeURL(D.channel.url))}" target="_blank" rel="noopener noreferrer">盗月社</a>所有，视频和封面直接从 YouTube 加载，欢迎去原频道点赞订阅。本站是非官方的粉丝旅行指南。</p>
      <p class="muted">整理方法：${D.videos.length} 期视频（约 ${hours} 小时）逐期依据字幕或转录整理，另读 B站评论补店名和地址。评论线索、交叉资料、待核实地址逐店标明。${esc(D.generated)} 更新。</p>
    </footer>`,
    mount(root) {
      root.querySelector('[data-home-search]').addEventListener('submit', (e) => {
        e.preventDefault();
        const q = new FormData(e.target).get('q').trim();
        goto('#/search' + (q ? '?q=' + encodeURIComponent(q) : ''));
      });
    }
  };
}
