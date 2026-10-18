/* Red Oil Atlas · 红油地图 — renders data/site.json */
(() => {
  'use strict';
  const FX = 0.19; // CAD per CNY, approximate
  // Data lives next to the page on GitHub Pages and locally; previews hosted elsewhere read the published copy.
  const DATA_BASE = /github\.io$|^localhost$|^127\.0\.0\.1$/.test(location.hostname) ? '' : 'https://chocolatemale.github.io/red-oil-atlas/';
  const PROV_ORDER = ['yunnan', 'guizhou', 'sichuan', 'chongqing', 'tibet'];
  const CATS = {
    noodles: ['Noodles', '粉面'], hotpot: ['Hot pot', '火锅'], bbq: ['Barbecue', '烧烤'], skewers: ['Skewers', '串串'],
    fish: ['Fish', '鱼'], mushroom: ['Mushrooms', '菌子'], snack: ['Street snacks', '小吃'], breakfast: ['Breakfast', '早餐'],
    rice: ['Rice & home dishes', '饭菜'], soup: ['Soups', '汤'], other: ['Other', '其他']
  };
  const UI = {
    'nav.map': ['Map', '地图'], 'nav.cities': ['Cities', '城市'], 'nav.menu': ['Menu', '菜单'], 'nav.videos': ['Episodes', '视频'], 'nav.notes': ['Field notes', '贴士'],
    'hero.eyebrow': ['A food field guide to Southwest China', '中国西南美食实地指南'],
    'hero.title': ['Southwest China, one bowl at a time.', '西南，一碗一碗吃过去。'],
    'hero.lede': ['Everything here comes from the travel-food videos of <a href="https://www.youtube.com/@DaoYueShe" target="_blank" rel="noopener">盗月社 DaoYueShe</a>. We went through their Yunnan and Guizhou episodes and wrote down what they ate, what it cost and how they reacted. Tap any dish or quote to watch the original moment.',
      '这里的一切都来自<a href="https://www.youtube.com/@DaoYueShe" target="_blank" rel="noopener">盗月社</a>的视频。我们把他们在云南、贵州拍的视频逐期过了一遍，记下吃了什么、花了多少钱、当时什么反应。点任意一道菜或一句原话，就能跳回视频里那一秒。'],
    'hero.pot': ['九宫格 · The nine-grid hot pot. Each cell is a city; the deeper the red, the spicier it is.', '九宫格：每一格是一座城市，颜色越红越辣。'],
    'map.eyebrow': ['Where they ate', '吃过的地方'], 'map.title': ['The map', '地图'],
    'map.sub': ['Dot size shows how many dishes they reviewed there. Hover or tap a dot to read the verdict.', '圆点越大，在那里点评过的菜越多。点圆点看评价。'],
    'cities.eyebrow': ['City by city', '一城一城看'], 'cities.title': ['What they thought of each place', '他们怎么评价每个地方'],
    'menu.eyebrow': ['Every dish, one menu', '所有菜，一张菜单'], 'menu.title': ['The menu', '菜单'],
    'menu.sub': ['Every dish they tried, with prices as filmed. Filter by province or type, cap the heat, then open a dish to watch them eat it.', '他们吃过的所有菜，价格以拍摄时为准。可以按省份、类别筛选，限制辣度，点开看他们吃的原画面。'],
    'menu.search': ['Search dishes', '搜索菜品'], 'menu.heat': ['Max heat', '最高辣度'], 'menu.sort': ['Sort', '排序'],
    'menu.sort.score': ['Most loved', '最受好评'], 'menu.sort.price': ['Cheapest', '最便宜'], 'menu.sort.heat': ['Spiciest', '最辣'], 'menu.sort.city': ['By city', '按城市'],
    'videos.eyebrow': ['Source material', '原始素材'], 'videos.title': ['The episodes', '本页用到的视频'],
    'videos.sub': ['The episodes this guide is built from, newest first. Episodes from 2021–2023 may show older prices.', '本页所依据的视频，按时间倒序。2021–2023 年的视频，价格可能已经变了。'],
    'pending.title': ['Still to watch: Chongqing, Sichuan & Tibet', '还没整理：重庆、四川、西藏'],
    'pending.sub': ['DaoYueShe has filmed much more in the Southwest. These episodes are not summarized in this guide yet, so they carry no ratings. Each one opens the original video.', '盗月社在西南拍的远不止这些。下面这些视频还没整理进本指南，所以没有评分；点开就是原视频。'],
    'notes.eyebrow': ['Before you go', '出发之前'], 'notes.title': ['Field notes', '实用贴士'],
    'notes.sub': ['Practical lessons the hosts learned on camera, so you don\'t have to.', '主播们在镜头前踩过的坑和学到的经验。'],
    'key.title': ['How to read the heat', '怎么看辣度'],
    'key.body': ['<b>麻 má</b> is the tingling numbness of Sichuan peppercorn. <b>辣 là</b> is chili heat. Both are rated 0–5 from what the hosts said and did on camera. When a local says <i>“不辣 bú là”</i> (“not spicy”), add two.',
      '<b>麻</b>是花椒的麻，<b>辣</b>是辣椒的辣，都按主播在镜头前的反应打 0–5 分。当地人说“不辣”的时候，请自动加两级。'],
    'foot.credit': ['All footage, quotes and frames belong to <a href="https://www.youtube.com/@DaoYueShe" target="_blank" rel="noopener">盗月社 DaoYueShe</a>. Videos and images load from YouTube; please watch, like and subscribe there. This is an unofficial, fan-made travel guide.',
      '所有画面、原话版权归<a href="https://www.youtube.com/@DaoYueShe" target="_blank" rel="noopener">盗月社</a>所有，视频和图片直接从 YouTube 加载，欢迎去原频道点赞订阅。本页是非官方的粉丝旅行指南。'],
    'foot.method': ['How it was made: each episode was transcribed (creator subtitles where available, otherwise speech recognition) and read in full. Quotes are short and lightly corrected for recognition errors. Ratings reflect how enthusiastic the hosts were, not our own taste. Prices are as filmed, in yuan (¥).',
      '制作方法：每期视频先转成文字（有作者字幕用字幕，否则用语音识别），再逐期读完整理。原话简短，只修正了识别错字。评分反映的是主播的喜爱程度。价格为拍摄时的人民币价格。'],
    'pl.yt': ['Open on YouTube ↗', '在 YouTube 打开 ↗'],
    'stat.videos': ['episodes', '期视频'], 'stat.dishes': ['dishes rated', '道菜'], 'stat.cities': ['places', '个地方'], 'stat.hours': ['hours watched', '小时素材'],
    'c.meal': ['Typical meal', '人均一顿'], 'c.heat': ['Heat', '辣度'], 'c.musteat': ['What to eat here', '在这里吃什么'],
    'c.said': ['In their words', '原话'], 'c.tips': ['Tips from the episodes', '视频里的提醒'], 'c.videos': ['Episodes filmed here', '在这里拍的视频'],
    'c.read': ['Read the chapter →', '去看这一章 →'], 'c.dishes': ['dishes', '道菜'], 'c.eps': ['episodes', '期'], 'c.must': ['Must eat', '必吃'],
    'm.count': ['{n} dishes', '共 {n} 道'], 'm.empty': ['Nothing matches. Try raising the heat limit or clearing a filter.', '没有符合条件的菜。试试调高辣度上限，或去掉一个筛选。'],
    'm.all': ['All', '全部'], 'm.noprice': ['price not mentioned', '视频里没说价格'],
    'd.what': ['What it is', '这是什么'], 'd.verdict': ['Their verdict', '主播评价'], 'd.where': ['Where', '在哪吃'], 'd.watch': ['Watch them eat it', '看原画面'],
    'fx': ['C$ amounts use roughly ¥1 = C$0.19.', '价格后面的 C$ 是加元，按 1 元人民币约 0.19 加元换算。'],
    'gen': ['Built {d} from {n} episodes.', '{d} 生成，基于 {n} 期视频。'],
    'v.all': ['All provinces', '全部省份'], 'p.title': ['Not yet summarized', '尚未整理']
  };

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } } };
  const state = { lang: 'zh', prov: 'all', cat: 'all', heat: 5, sort: 'score', q: '', vprov: 'all', mapSel: null };
  let D, MAP; const byId = {}, cityById = {}, dishById = {}, provById = {};

  const isZh = () => state.lang === 'zh';
  const ui = (k) => (UI[k] ? UI[k][isZh() ? 1 : 0] : k);
  function bi(o, base) {
    const en = o[base + '_en'], zh = o[base + '_zh'];
    if (state.lang === 'en') return esc(en || zh);
    if (state.lang === 'zh') return esc(zh || en);
    return esc(en || zh) + (zh && en ? `<span class="zh-sub">${esc(zh)}</span>` : '');
  }
  const one = (o, base) => esc(isZh() ? (o[base + '_zh'] || o[base + '_en']) : (o[base + '_en'] || o[base + '_zh']));
  const name = (o) => (o ? (isZh() ? o.zh : o.en) : '');
  const mmss = (t) => { t = Math.max(0, Math.round(t || 0)); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };
  const cad = (cny) => (cny == null ? '' : 'C$' + (cny * FX < 10 ? (cny * FX).toFixed(1) : Math.round(cny * FX)));
  const pcol = (p) => `var(--p-${p})`;
  const enTitle = (v) => (v.title_en && v.title_en !== v.title_zh && /[A-Za-z]{3}/.test(v.title_en) ? v.title_en : '');
  const yt = (id, q) => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
  const stars = (n) => `<span class="stars" aria-label="评分 ${n}/5">${'●'.repeat(n)}<span class="off">${'●'.repeat(5 - n)}</span></span>`;
  const drops = (n, kind) => `<span class="drops ${kind}" aria-hidden="true">${Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
  const heatMeter = (sp) => `<div class="heat-m" aria-label="麻 ${sp.ma}/5，辣 ${sp.la}/5"><div class="heat-row">麻${drops(sp.ma, 'ma')}</div><div class="heat-row">辣${drops(sp.la, 'la')}</div></div>`;
  const priceTag = (d) => (d.price_cny ? `<span class="price">¥${d.price_cny}<small> 约${cad(d.price_cny)}</small></span>` : (d.price_cny === 0 ? `<span class="price">${isZh() ? '免费' : 'free'}</span>` : ''));
  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  /* ---------- static text ---------- */
  function applyStatic() {
    document.documentElement.lang = isZh() ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = ui(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = ui(el.dataset.i18nHtml); });
    document.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
    $('.h1-zh').hidden = isZh();
    $('#q').placeholder = isZh() ? '搜索：米线、火锅、昆明…' : 'Search: noodles, 火锅, Kunming…';
    $('#fx-note').textContent = ui('fx');
  }

  /* ---------- hero ---------- */
  function renderHero() {
    const hrs = D.videos.reduce((a, v) => a + (v.duration || 0), 0) / 3600;
    $('#stats').innerHTML = [[D.videos.length, 'stat.videos'], [D.dishes.length, 'stat.dishes'], [D.cities.length, 'stat.cities'], [Math.round(hrs), 'stat.hours']]
      .map(([n, k]) => `<div><dt>${ui(k)}</dt><dd>${n}</dd></div>`).join('');
    if (!$('#hero-photos').children.length) {
      const picks = D.videos.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 16);
      $('#hero-photos').innerHTML = picks.map((v) => `<img src="${yt(v.id, 'hqdefault')}" alt="" loading="eager" decoding="async">`).join('');
    }
  }
  function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function renderPot() {
    const svg = $('#pot');
    const nine = D.cities.filter((c) => c._n >= 2 && !/other|border/.test(c.id)).sort((a, b) => b._n - a._n).slice(0, 9);
    const S = 112, O = 32, C = 200, R = 168;
    const oils = [['#E9963F', '#B9531C'], ['#E27F33', '#A6431A'], ['#D9632A', '#933516'], ['#CB4A21', '#7E2611'], ['#B9351A', '#691A0D'], ['#A2220F', '#560F08']];
    let cells = '';
    nine.forEach((c, i) => {
      const r = Math.floor(i / 3), col = i % 3, x = O + col * S, y = O + r * S;
      const heat = Math.min(5, Math.max(c.spice?.la ?? 2, c.spice?.ma ?? 0));
      let cx = x + S / 2, cy = y + S / 2;
      const corner = r !== 1 && col !== 1;
      if (corner) { cx += (C - cx) * 0.2; cy += (C - cy) * 0.2; } else { if (r !== 1) cy += (C - cy) * 0.12; if (col !== 1) cx += (C - cx) * 0.12; }
      const zh = c.zh.replace(/（.*）/, '');
      const en = c.en.replace(/ \(.*\)/, '').toUpperCase();
      cells += `<g class="cell" tabindex="0" role="link" data-city="${c.id}" aria-label="${esc(c.zh)}">
        <rect x="${x}" y="${y}" width="${S}" height="${S}" fill="url(#oil${heat})"></rect>
        <text x="${cx}" y="${cy + (isZh() ? 9 : 2)}" text-anchor="middle" font-family="Noto Serif SC, serif" font-weight="900" font-size="${corner ? 21 : (zh.length > 2 ? 21 : 27)}" fill="#FFF4E2">${esc(zh)}</text>
        ${isZh() ? '' : `<text x="${cx}" y="${cy + 20}" text-anchor="middle" font-family="Figtree, sans-serif" font-size="${corner ? 8.5 : 10.5}" font-weight="700" fill="#FFE2BC" opacity=".92" letter-spacing="1.2">${esc(en)}</text>`}</g>`;
    });
    const grads = oils.map(([a, b], h) => `<radialGradient id="oil${h}" cx="50%" cy="38%" r="78%"><stop offset="0" stop-color="${a}"></stop><stop offset="1" stop-color="${b}"></stop></radialGradient>`).join('');
    const rnd = mulberry(7); let bubbles = '';
    for (let i = 0; i < 26; i++) {
      const ang = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * (R - 14);
      bubbles += `<circle class="bub" cx="${(C + Math.cos(ang) * rr).toFixed(1)}" cy="${(C + Math.sin(ang) * rr).toFixed(1)}" r="${(2 + rnd() * 4).toFixed(1)}" fill="none" stroke="#FFD9A0" stroke-width="1.2" style="animation-delay:${(rnd() * 3.6).toFixed(2)}s"></circle>`;
    }
    const grid = `M${O + S} ${O}V${O + 3 * S}M${O + 2 * S} ${O}V${O + 3 * S}M${O} ${O + S}H${O + 3 * S}M${O} ${O + 2 * S}H${O + 3 * S}`;
    svg.innerHTML = `<title id="pot-title">九宫格火锅：每一格是一座城市，点击跳到对应章节。</title><defs>${grads}<clipPath id="potclip"><circle cx="${C}" cy="${C}" r="${R}"></circle></clipPath></defs>
      <circle cx="${C}" cy="${C}" r="194" fill="#2b2420"></circle><circle cx="${C}" cy="${C}" r="186" fill="none" stroke="#4a3d35" stroke-width="2"></circle>
      <g clip-path="url(#potclip)"><circle cx="${C}" cy="${C}" r="${R}" fill="url(#oil3)"></circle>${cells}
        <path d="${grid}" stroke="#D9B27A" stroke-width="7" stroke-linecap="round"></path><path d="${grid}" stroke="#FFF1D6" stroke-width="1.5" opacity=".55"></path>
        <g pointer-events="none">${bubbles}</g></g>
      <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#D9B27A" stroke-width="5"></circle>`;
    svg.querySelectorAll('.cell').forEach((g) => {
      const go = () => goCity(g.dataset.city);
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }
  function goCity(id) {
    const el = document.getElementById('city-' + id); if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: smooth() });
    history.replaceState(null, '', '#city-' + id);
  }

  /* ---------- map ---------- */
  function proj(lon, lat) { const p = MAP.proj; return [(lon - p.lon0) * p.k * p.cos, (p.lat1 - lat) * p.k]; }
  const PROV_LABEL = { sichuan: [102.2, 31.6], chongqing: [107.9, 30.6], yunnan: [99.6, 27.6], guizhou: [106.2, 28.6], tibet: [92.6, 31.4] };
  const LABEL_SIDE = { chuxiong: 'left', yuanyang: 'left', mangshi: 'left', liupanshui: 'left', anshun: 'below', guiyang: 'above', mengzi: 'right', kunming: 'right' };
  function renderMap() {
    const svg = $('#map-svg');
    svg.setAttribute('viewBox', MAP.viewBox.join(' '));
    let h = MAP.regions.map((r) => `<path class="rg" d="${r.d}" ${r.sw ? `style="fill:color-mix(in oklch, ${pcol(r.id)} 14%, var(--surface));stroke:color-mix(in oklch, ${pcol(r.id)} 45%, var(--line))"` : ''}></path>`).join('');
    PROV_ORDER.forEach((p) => {
      const [x, y] = proj(...PROV_LABEL[p]);
      h += `<text class="rg-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" style="fill:${pcol(p)}">${esc(name(provById[p]))}</text>`;
    });
    D.cities.filter((c) => c.lat && c.lon).sort((a, b) => b._n - a._n).forEach((c) => {
      const [x, y] = proj(c.lon, c.lat); const r = 5 + Math.sqrt(c._n) * 2.6;
      h += `<g class="dot" tabindex="0" role="button" data-city="${c.id}" aria-label="${esc(c.zh)}，${c._n} 道菜">
        <circle class="halo" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r + 6).toFixed(1)}" style="stroke:${pcol(c.province)}"></circle>
        <circle class="d" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" style="fill:${pcol(c.province)}"></circle>
        ${/other|border/.test(c.id) ? '' : labelAt(c, x, y, r)}</g>`;
    });
    svg.innerHTML = h;
    svg.querySelectorAll('.dot').forEach((g) => {
      const sel = () => { state.mapSel = g.dataset.city; mapCard(); };
      g.addEventListener('click', sel); g.addEventListener('mouseenter', sel);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(); } });
    });
    if (!state.mapSel) state.mapSel = (cityById.kunming || D.cities[0]).id;
    mapCard();
    $('#legend').innerHTML = PROV_ORDER.map((p) => `<li><i style="background:${pcol(p)}"></i>${esc(provById[p].zh)}${D.cities.some((c) => c.province === p) ? '' : ` <span class="muted">· ${ui('p.title')}</span>`}</li>`).join('');
  }
  function labelAt(c, x, y, r) {
    const t = esc(name(c).replace(/ \(.*\)|（.*）/, '')); const side = LABEL_SIDE[c.id] || 'right';
    if (side === 'left') return `<text x="${(x - r - 5).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end">${t}</text>`;
    if (side === 'below') return `<text x="${x.toFixed(1)}" y="${(y + r + 15).toFixed(1)}" text-anchor="middle">${t}</text>`;
    if (side === 'above') return `<text x="${x.toFixed(1)}" y="${(y - r - 7).toFixed(1)}" text-anchor="middle">${t}</text>`;
    return `<text x="${(x + r + 5).toFixed(1)}" y="${(y + 4).toFixed(1)}">${t}</text>`;
  }
  function mapCard() {
    const c = cityById[state.mapSel]; if (!c) return;
    $('#map-svg').querySelectorAll('.dot').forEach((g) => g.classList.toggle('on', g.dataset.city === c.id));
    const top = (c.must_eat || []).slice(0, 3).map((id) => dishById[id]).filter(Boolean);
    $('#map-card').innerHTML = `<img class="mc-img" src="${yt(c._lead, 'maxresdefault')}" alt="" loading="lazy">
      <div class="mc-body"><p class="eyebrow" style="color:${pcol(c.province)};margin:0">${esc(name(provById[c.province]))}</p>
      <div class="mc-name"><b>${esc(c.zh)}</b></div>
      <p>${one(c, 'verdict')}</p>
      ${top.length ? `<div class="tags">${top.map((d) => `<span class="tag">${esc(d.zh)} · ${esc(d.en)}</span>`).join('')}</div>` : ''}
      <a class="go" href="#city-${c.id}" data-go="${c.id}">${ui('c.read')}</a></div>`;
  }

  /* ---------- cities ---------- */
  function renderCityIndex() {
    $('#city-index').innerHTML = PROV_ORDER.filter((p) => D.cities.some((c) => c.province === p)).map((p) => {
      const cs = D.cities.filter((c) => c.province === p).sort((a, b) => b._n - a._n);
      return `<div class="ci-group"><h3 style="color:${pcol(p)}">${esc(provById[p].zh)}</h3><div class="ci-links">${cs.map((c) => `<a href="#city-${c.id}" data-go="${c.id}"><b>${esc(c.zh)}</b>${isZh() ? '' : esc(c.en)} <small>${c._n}</small></a>`).join('')}</div></div>`;
    }).join('');
  }
  function playBtn(vid, t, q, cityId) {
    return `<button type="button" class="play" data-v="${vid}" data-t="${t || 0}" data-qz="${esc(q?.quote_zh || '')}" data-qe="${esc(q?.quote_en || '')}" data-c="${cityId || ''}" aria-label="从 ${mmss(t)} 开始播放">${mmss(t)}</button>`;
  }
  function quoteHTML(q, cityId) {
    return `<figure class="q"><p class="qzh">${esc(q.quote_zh)}</p>${isZh() ? '' : `<p class="qen">${esc(q.quote_en)}</p>`}
      <footer><span>${esc(isZh() ? q.speaker_zh : q.speaker_en)}</span>${playBtn(q.video, q.t, q, cityId)}</footer></figure>`;
  }
  function dishCard(d, must) {
    return `<button type="button" class="dcard" data-dish="${d.id}" style="--pc:${pcol(d.province)}">
      <span class="dimg"><img src="${d.img}" alt="" loading="lazy">${must ? `<span class="rank">${ui('c.must')}</span>` : ''}${priceTag(d)}</span>
      <span class="dbody"><span class="dzh">${esc(d.zh)}</span>${isZh() ? '' : `<span class="den">${esc(d.en)}</span>`}
        <span class="dv">${one(d, 'verdict')}</span>
        <span class="dfoot">${stars(d.score)}${heatMeter(d.spice)}</span></span></button>`;
  }
  function videoTile(v, withSum) {
    const c = cityById[v.city];
    return `<button type="button" class="vt" data-v="${v.id}" data-t="0">
      <span class="th"><img loading="lazy" src="${yt(v.id, 'mqdefault')}" alt="" width="320" height="180"><span class="dur">${mmss(v.duration)}</span></span>
      <span class="vtt">${esc(v.title_zh)}</span>${!isZh() && enTitle(v) ? `<span class="vten">${esc(enTitle(v))}</span>` : ''}
      <span class="vsub">${(v.upload_date || '').slice(0, 7)} · ${esc(name(c))}</span>
      ${withSum ? `<span class="vsum">${one(v, 'summary')}</span>` : ''}</button>`;
  }
  function renderCities() {
    let h = '';
    PROV_ORDER.forEach((p) => {
      const cs = D.cities.filter((c) => c.province === p).sort((a, b) => b._n - a._n);
      if (!cs.length) return;
      const pr = provById[p];
      h += `<div class="prov-band" style="--pc:${pcol(p)}" id="prov-${p}"><div class="wrap"><h3>${esc(pr.zh)}</h3><p>${one(pr, 'blurb')}</p></div></div>`;
      cs.forEach((c) => {
        const must = (c.must_eat || []).map((id) => dishById[id]).filter(Boolean);
        const rest = D.dishes.filter((d) => d.city === c.id && !must.includes(d)).sort((a, b) => b.score - a.score);
        const vids = (c.videos || []).map((id) => byId[id]).filter(Boolean).sort((a, b) => (b.upload_date || '').localeCompare(a.upload_date || ''));
        h += `<article class="city" id="city-${c.id}" style="--pc:${pcol(p)}" aria-labelledby="ct-${c.id}" data-screen-label="${esc(c.en)}"><div class="wrap">
          <div class="city-banner"><img src="${yt(c._lead, 'maxresdefault')}" alt="" loading="lazy">
            <div class="banner-in"><div class="sign-board" id="ct-${c.id}">${esc(c.zh.replace(/（.*）/, ''))}</div>
              <div class="banner-text"><span class="ct-meta">${esc(pr.zh)} · ${c._n} ${ui('c.dishes')} · ${vids.length} ${ui('c.eps')}</span>
                <span class="ct-en">${esc(c.zh)}</span></div></div></div>
          <div class="city-body">
            <div class="verdict-wrap"><p class="verdict">${esc(isZh() ? c.verdict_zh : c.verdict_en)}</p>${state.lang === 'both' ? `<p class="verdict-zh">${esc(c.verdict_zh)}</p>` : ''}</div>
            <div class="city-facts">
              ${c.typical_meal_cny != null ? `<div class="fact"><span>${ui('c.meal')}</span><b>¥${c.typical_meal_cny}<small>约${cad(c.typical_meal_cny)}</small></b></div>` : ''}
              <div class="fact"><span>${ui('c.heat')}</span>${heatMeter(c.spice || { ma: 0, la: 0 })}</div>
              ${(c.vibe_tags || []).length ? `<div class="tags">${c.vibe_tags.map((t) => `<span class="tag">${esc(isZh() ? t.zh : t.en)}</span>`).join('')}</div>` : ''}
            </div>
            ${must.length + rest.length ? `<div><h4 class="subhead">${ui('c.musteat')}</h4><div class="dishes">${must.map((d) => dishCard(d, true)).join('')}${rest.map((d) => dishCard(d, false)).join('')}</div></div>` : ''}
            ${(c.impressions || []).length ? `<div><h4 class="subhead">${ui('c.said')}</h4><div class="quotes">${c.impressions.map((q) => quoteHTML(q, c.id)).join('')}</div></div>` : ''}
            ${(c.tips || []).length ? `<div><h4 class="subhead">${ui('c.tips')}</h4><ul class="tips">${c.tips.map((t) => `<li><span>${esc(isZh() ? t.zh : t.en)}${state.lang === 'both' ? `<span class="tzh">${esc(t.zh)}</span>` : ''}</span>${playBtn(t.video, t.t, { quote_zh: t.zh, quote_en: t.en }, c.id)}</li>`).join('')}</ul></div>` : ''}
            ${vids.length ? `<div><h4 class="subhead">${ui('c.videos')}</h4><div class="vstrip">${vids.map((v) => videoTile(v, false)).join('')}</div></div>` : ''}
          </div></div></article>`;
      });
    });
    $('#city-list').innerHTML = h;
  }

  /* ---------- menu ---------- */
  function renderFilters() {
    const provs = PROV_ORDER.filter((p) => D.dishes.some((d) => d.province === p));
    $('#f-province').innerHTML = [`<button type="button" class="chip" data-p="all" aria-pressed="${state.prov === 'all'}">${ui('m.all')}</button>`]
      .concat(provs.map((p) => `<button type="button" class="chip" data-p="${p}" aria-pressed="${state.prov === p}"><i style="background:${pcol(p)}"></i>${esc(name(provById[p]))}</button>`)).join('');
    const cats = Object.keys(CATS).filter((k) => D.dishes.some((d) => d.category === k));
    $('#f-cat').innerHTML = [`<button type="button" class="chip" data-c="all" aria-pressed="${state.cat === 'all'}">${ui('m.all')}</button>`]
      .concat(cats.map((k) => `<button type="button" class="chip" data-c="${k}" aria-pressed="${state.cat === k}">${CATS[k][isZh() ? 1 : 0]}</button>`)).join('');
    const vprovs = PROV_ORDER.filter((p) => D.videos.some((v) => v.province === p));
    $('#v-province').innerHTML = [`<button type="button" class="chip" data-vp="all" aria-pressed="${state.vprov === 'all'}">${ui('v.all')}</button>`]
      .concat(vprovs.map((p) => `<button type="button" class="chip" data-vp="${p}" aria-pressed="${state.vprov === p}"><i style="background:${pcol(p)}"></i>${esc(name(provById[p]))} <small>${D.videos.filter((v) => v.province === p).length}</small></button>`)).join('');
  }
  function renderMenu() {
    const q = state.q.trim().toLowerCase();
    const list = D.dishes.filter((d) => (state.prov === 'all' || d.province === state.prov) && (state.cat === 'all' || d.category === state.cat)
      && Math.max(d.spice.la, d.spice.ma) <= state.heat
      && (!q || [d.zh, d.en, d.pinyin, d.what_en, cityById[d.city]?.en, cityById[d.city]?.zh, d.place_en, d.place_zh].join(' ').toLowerCase().includes(q)));
    const by = {
      score: (a, b) => b.score - a.score || (a.price_cny ?? 999) - (b.price_cny ?? 999),
      price: (a, b) => (a.price_cny ?? 1e9) - (b.price_cny ?? 1e9),
      heat: (a, b) => (b.spice.la + b.spice.ma) - (a.spice.la + a.spice.ma),
      city: (a, b) => PROV_ORDER.indexOf(a.province) - PROV_ORDER.indexOf(b.province) || a.city.localeCompare(b.city) || b.score - a.score
    }[state.sort];
    list.sort(by);
    $('#menu-count').textContent = ui('m.count').replace('{n}', list.length);
    $('#menu-list').innerHTML = list.length ? list.map((d) => `<li class="mi"><button type="button" data-dish="${d.id}">
      <img src="${d.img}" alt="" loading="lazy" width="64" height="64">
      <span class="mt"><span class="l1"><span class="mzh">${esc(d.zh)}</span>${isZh() ? '' : `<span class="men">${esc(d.en)}</span>`}<span class="lead"></span><span class="mp">${d.price_cny != null ? '¥' + d.price_cny : '—'}</span></span>
      <span class="l2"><span><i class="pdot" style="background:${pcol(d.province)}"></i>${esc(name(cityById[d.city]))}</span>${stars(d.score)}<span>${d.spice.ma ? '麻' + d.spice.ma + ' · ' : ''}辣${d.spice.la}</span>${d.price_cny ? `<span>约${cad(d.price_cny)}</span>` : ''}</span></span></button></li>`).join('')
      : `<li class="empty">${ui('m.empty')}</li>`;
  }

  /* ---------- episodes, pending, notes ---------- */
  function renderVideos() {
    const vs = D.videos.filter((v) => state.vprov === 'all' || v.province === state.vprov).sort((a, b) => (b.upload_date || '').localeCompare(a.upload_date || ''));
    $('#video-grid').innerHTML = vs.map((v) => `<li>${videoTile(v, true)}</li>`).join('');
    $('#pending-list').innerHTML = (D.pending || []).map((v) => `<li><button type="button" data-v="${v.id}" data-t="0" class="pv">
      <img src="${yt(v.id, 'mqdefault')}" alt="" loading="lazy" width="112" height="63">
      <span><span class="pt">${esc(v.title_zh)}</span>${!isZh() && enTitle(v) ? `<span class="pe">${esc(enTitle(v))}</span>` : ''}<span class="pe" style="color:${pcol(v.province)}">${esc(name(provById[v.province]))}${v.duration ? ' · ' + mmss(v.duration) : ''}</span></span></button></li>`).join('');
  }
  function renderNotes() {
    const cards = [];
    PROV_ORDER.forEach((p) => D.cities.filter((c) => c.province === p).forEach((c) => (c.tips || []).forEach((t) => cards.push({ c, t }))));
    $('#notes-list').innerHTML = cards.map(({ c, t }) => `<div class="note" style="--pc:${pcol(c.province)}"><h4>${esc(name(c))}</h4>
      <p>${esc(isZh() ? t.zh : t.en)}</p>${state.lang === 'both' ? `<p class="tzh">${esc(t.zh)}</p>` : ''}<div>${playBtn(t.video, t.t, { quote_zh: t.zh, quote_en: t.en }, c.id)}</div></div>`).join('');
  }

  /* ---------- dialogs ---------- */
  function openPlayer(vid, t, qz, qe, cityId) {
    const v = byId[vid] || (D.pending || []).find((p) => p.id === vid);
    const start = Math.max(0, Math.round(t || 0) - 1);
    $('#pl-embed').outerHTML = `<iframe id="pl-embed" src="https://www.youtube-nocookie.com/embed/${vid}?start=${start}&amp;autoplay=1&amp;rel=0&amp;playsinline=1" title="${esc(v?.title_zh || 'YouTube 视频')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen=""></iframe>`;
    const c = cityById[cityId] || cityById[v?.city] || provById[v?.province];
    $('#pl-where').textContent = c ? c.zh : '';
    $('#pl-where').style.color = c ? pcol(c.province || c.id) : '';
    $('#pl-title').textContent = v?.title_zh || '';
    $('#pl-quote').innerHTML = qz ? `<p class="qzh">${esc(qz)}</p>${!isZh() && qe ? `<p class="qen">${esc(qe)}</p>` : ''}` : '';
    $('#pl-meta').textContent = `${mmss(t)}${v?.duration ? ' / ' + mmss(v.duration) : ''}${v?.upload_date ? ' · ' + v.upload_date : ''}`;
    $('#pl-yt').href = `https://www.youtube.com/watch?v=${vid}&t=${start}s`;
    if ($('#dish').open) $('#dish').close();
    if (!$('#player').open) $('#player').showModal();
  }
  function closePlayer() { $('#pl-embed').outerHTML = '<div id="pl-embed"></div>'; if ($('#player').open) $('#player').close(); }
  function openDish(id) {
    const d = dishById[id]; if (!d) return; const c = cityById[d.city];
    $('#dish-body').innerHTML = `<div class="dd" style="--pc:${pcol(d.province)}">
      <img class="dd-img" src="${d.img.replace(/hq(\d)\.jpg$/, 'hq$1.jpg')}" alt="">
      <button type="button" class="x-btn" data-close-dish="" aria-label="关闭">×</button>
      <div class="dd-body">
        <p class="eyebrow" style="color:${pcol(d.province)};margin:0">${esc(c ? c.zh : '')} · ${CATS[d.category]?.[isZh() ? 1 : 0] || ''}</p>
        <div><div class="dd-zh" id="dd-title">${esc(d.zh)}</div>${isZh() ? '' : `<div class="dd-en">${esc(d.en)}</div>`}${d.pinyin ? `<div class="dd-py">${esc(d.pinyin)}</div>` : ''}</div>
        <div class="row">${priceTag(d) || `<span class="muted">${ui('m.noprice')}</span>`}${stars(d.score)}${heatMeter(d.spice)}</div>
        ${d.price_note_en ? `<p class="muted">${one(d, 'price_note')}</p>` : ''}
        <div><h4 class="subhead">${ui('d.what')}</h4><p>${bi(d, 'what')}</p></div>
        <div><h4 class="subhead">${ui('d.verdict')}</h4><p>${bi(d, 'verdict')}</p></div>
        ${d.place_en ? `<p class="where"><b>${ui('d.where')}:</b> ${one(d, 'place')}</p>` : ''}
        ${d.quote_zh ? `<figure class="q"><p class="qzh">${esc(d.quote_zh)}</p>${isZh() ? '' : `<p class="qen">${esc(d.quote_en)}</p>`}<footer><span>${ui('d.watch')}</span>${playBtn(d.video, d.t, d, d.city)}</footer></figure>` : ''}
      </div></div>`;
    $('#dish').showModal();
  }

  /* ---------- wiring ---------- */
  function renderAll() {
    applyStatic(); renderHero(); renderPot(); renderMap(); renderCityIndex(); renderCities(); renderFilters(); renderMenu(); renderVideos(); renderNotes();
    $('#foot-gen').textContent = ui('gen').replace('{d}', D.generated).replace('{n}', D.videos.length);
  }
  // YouTube serves a 120x90 grey placeholder when a high-res cover doesn't exist; fall back to the standard cover.
  function coverFallback(e) {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !/i\.ytimg\.com\/vi\/[^/]+\/(maxresdefault|sddefault)\.jpg/.test(img.src)) return;
    if (e.type === 'error' || img.naturalWidth <= 120) img.src = img.src.replace(/(maxresdefault|sddefault)\.jpg$/, 'hqdefault.jpg');
  }
  function wire() {
    document.addEventListener('load', coverFallback, true);
    document.addEventListener('error', coverFallback, true);
    document.addEventListener('click', (e) => {
      const p = e.target.closest('[data-v]');
      if (p) { e.preventDefault(); openPlayer(p.dataset.v, +p.dataset.t, p.dataset.qz, p.dataset.qe, p.dataset.c); return; }
      const dd = e.target.closest('[data-dish]'); if (dd) { openDish(dd.dataset.dish); return; }
      if (e.target.closest('[data-close-dish]')) { $('#dish').close(); return; }
      const go = e.target.closest('[data-go]'); if (go) { e.preventDefault(); goCity(go.dataset.go); return; }
      const ch = e.target.closest('.chip');
      if (ch) {
        if (ch.dataset.vp) { state.vprov = ch.dataset.vp; renderFilters(); renderVideos(); return; }
        if (ch.dataset.p) state.prov = ch.dataset.p; else if (ch.dataset.c) state.cat = ch.dataset.c;
        renderFilters(); renderMenu(); return;
      }
      const lb = e.target.closest('.seg button');
      if (lb) { state.lang = lb.dataset.lang; store.set('roa-lang', state.lang); const y = window.scrollY; renderAll(); window.scrollTo(0, y); }
    });
    $('#pl-close').addEventListener('click', closePlayer);
    $('#player').addEventListener('close', () => { $('#pl-embed').outerHTML = '<div id="pl-embed"></div>'; });
    $('#player').addEventListener('click', (e) => { if (e.target === e.currentTarget) closePlayer(); });
    $('#dish').addEventListener('click', (e) => { if (e.target === e.currentTarget) $('#dish').close(); });
    $('#q').addEventListener('input', (e) => { state.q = e.target.value; renderMenu(); });
    $('#f-heat').addEventListener('input', (e) => { state.heat = +e.target.value; $('#f-heat-out').textContent = e.target.value; renderMenu(); });
    $('#f-sort').addEventListener('change', (e) => { state.sort = e.target.value; renderMenu(); });
    $('#filters').addEventListener('submit', (e) => e.preventDefault());
  }

  async function boot() {
    [D, MAP] = await Promise.all([fetch(DATA_BASE + 'data/site.json').then((r) => r.json()), fetch(DATA_BASE + 'data/map.json').then((r) => r.json())]);
    D.videos.forEach((v) => (byId[v.id] = v));
    D.provinces.forEach((p) => (provById[p.id] = p));
    D.dishes.forEach((d) => (dishById[d.id] = d));
    D.cities.forEach((c) => {
      cityById[c.id] = c;
      c._n = D.dishes.filter((d) => d.city === c.id).length;
      const vs = (c.videos || []).map((id) => byId[id]).filter(Boolean).sort((a, b) => (b.views || 0) - (a.views || 0));
      c._lead = vs[0]?.id;
    });
    wire(); renderAll();
    if (location.hash.startsWith('#city-')) setTimeout(() => goCity(location.hash.slice(6)), 80);
  }
  boot().catch((err) => {
    console.error(err);
    document.querySelector('main').insertAdjacentHTML('afterbegin', `<p class="wrap" style="padding:24px 20px;color:var(--chili)">数据没有加载出来（${esc(err.message)}），请刷新页面重试。</p>`);
  });
})();
