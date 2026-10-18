/* Red Oil Atlas · 红油地图 — renders data/site.json */
(() => {
  'use strict';
  const FX = 0.19; // CAD per CNY, approximate
  // Data lives next to the page on GitHub Pages and locally; previews hosted elsewhere read the published copy.
  const DATA_BASE = /github\.io$|^localhost$|^127\.0\.0\.1$/.test(location.hostname) ? '' : 'https://chocolatemale.github.io/red-oil-atlas/';
  const PROV_ORDER = ['guizhou', 'yunnan', 'sichuan', 'chongqing', 'tibet'];
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
      '跟着<a href="https://www.youtube.com/@DaoYueShe" target="_blank" rel="noopener">盗月社</a>，从贵州吃到云南。先找店，再看地址、招牌菜和评论线索；想知道主播怎么说，点开菜品就能回到视频里的那一秒。'],
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
    'pending.title': ['Not yet reviewed episode by episode', '尚未逐期整理的视频'],
    'pending.sub': ['DaoYueShe has filmed much more in the Southwest. These episodes are not summarized in this guide yet, so they carry no ratings. Each one opens the original video.', '盗月社在西南拍的远不止这些。下面这些视频还没整理进本指南，所以没有评分；点开就是原视频。'],
    'notes.eyebrow': ['Before you go', '出发之前'], 'notes.title': ['Field notes', '实用贴士'],
    'notes.sub': ['Practical lessons the hosts learned on camera, so you don\'t have to.', '主播们在镜头前踩过的坑和学到的经验。'],
    'key.title': ['How to read the heat', '怎么看辣度'],
    'key.body': ['<b>麻 má</b> is the tingling numbness of Sichuan peppercorn. <b>辣 là</b> is chili heat. Both are rated 0–5 from what the hosts said and did on camera. When a local says <i>“不辣 bú là”</i> (“not spicy”), add two.',
      '<b>麻</b>是花椒的麻，<b>辣</b>是辣椒的辣，都按主播在镜头前的反应打 0–5 分。当地人说“不辣”的时候，请自动加两级。'],
    'foot.credit': ['All footage, quotes and frames belong to <a href="https://www.youtube.com/@DaoYueShe" target="_blank" rel="noopener">盗月社 DaoYueShe</a>. Videos and images load from YouTube; please watch, like and subscribe there. This is an unofficial, fan-made travel guide.',
      '所有画面、原话版权归<a href="https://www.youtube.com/@DaoYueShe" target="_blank" rel="noopener">盗月社</a>所有，视频和图片直接从 YouTube 加载，欢迎去原频道点赞订阅。本页是非官方的粉丝旅行指南。'],
    'foot.method': ['How it was made: each episode was transcribed (creator subtitles where available, otherwise speech recognition) and read in full. Quotes are short and lightly corrected for recognition errors. Ratings reflect how enthusiastic the hosts were, not our own taste. Prices are as filmed, in yuan (¥).',
      '制作方法：原有视频依据字幕或语音转录逐期整理；本次另读 B 站评论补店名、地址与不同观点。新增的纯评论资料不生成主播评分。评论线索、交叉资料和待核实地址逐店标明，地图搜索不等于确认店址。价格与口味以拍摄时为准，出发前请再核对。'],
    'pl.yt': ['Open on YouTube ↗', '在 YouTube 打开 ↗'],
    'stat.videos': ['episodes', '期视频'], 'stat.dishes': ['dishes rated', '道已评菜品'], 'stat.cities': ['places', '个地方'], 'stat.hours': ['hours watched', '小时素材'],
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
    if (!state.mapSel) state.mapSel = (cityById.zunyi || D.cities[0]).id;
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
      ${top.length ? `<div class="tags">${top.map((d) => `<span class="tag">${esc(d.zh)}</span>`).join('')}</div>` : ''}
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
  function dishCard(d, must, currentShop = null) {
    return `<div class="atlas-dish-wrap"><button type="button" class="dcard" data-dish="${d.id}" style="--pc:${pcol(d.province)}">
      <span class="dimg"><img src="${d.img}" alt="" loading="lazy">${must ? `<span class="rank">${ui('c.must')}</span>` : ''}${priceTag(d)}</span>
      <span class="dbody"><span class="dzh">${esc(d.zh)}</span>${isZh() ? '' : `<span class="den">${esc(d.en)}</span>`}
        <span class="dv">${one(d, 'verdict')}</span>
        <span class="dfoot">${stars(d.score)}${heatMeter(d.spice)}</span></span></button>${shops().filter(s=>s.id !== currentShop && (s.dish_ids||[]).includes(d.id)).map(s=>`<a class="atlas-dish-shop" href="${shopHref(s)}">${esc(s.name)} · 店铺详情 →</a>`).join('')}</div>`;
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
            ${shopLinksForCity(c.id)}
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
    const bili = (D.bilibili || []).filter(v => state.vprov === 'all' || provinceKey(v.province) === state.vprov);
    $('#bili-grid').innerHTML = bili.length ? `<h3>哔哩哔哩补充资料</h3><p class="muted">按已查到的资料补充，不代表已经完成逐句视频整理。</p><div class="atlas-shop-grid">${bili.map(v => `<article class="atlas-panel"><p class="eyebrow">${esc(cityName(v.city))}</p><h4>${esc(v.title)}</h4><p>${esc(Array.isArray(v.notes)?v.notes.join('；'):(v.notes||''))}</p>${outLink(v.url, '在哔哩哔哩查看')}<div class="atlas-related">${(v.shops||[]).map(id=>shops().find(s=>s.id===id)).filter(Boolean).map(s=>`<a href="${shopHref(s)}">${esc(s.name)} · 店铺详情 →</a>`).join('')}</div></article>`).join('')}</div>` : '';

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
    if (location.hash.startsWith('#shop/') && $('#store-embed')) {
      if ($('#dish').open) $('#dish').close();
      setStoreVideo(vid, t, true); return;
    }
    const start = Math.max(0, Math.round(t || 0) - 1);
    $('#pl-embed').outerHTML = `<iframe id="pl-embed" src="${esc(StoreMedia.embedURL(vid,t,true,location.origin))}" referrerpolicy="strict-origin-when-cross-origin" title="${esc(v?.title_zh || 'YouTube 视频')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen=""></iframe>`;
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
        ${shopLinksForDish(d.id)}
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
      // The same shop hash does not emit hashchange; dismiss a dish dialog explicitly.
      if (e.target.closest('a[href^="#shop/"]') && $('#dish').open) $('#dish').close();
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

  /* Store pages: stable hash URLs, evidence-aware positions, no inferred coordinates. */
  const shopState = { province: 'guizhou', city: 'all', q: '', scroll: 0, status: 'all', visible: 12 };
  const shops = () => D.shops || [];
  const provinceKey = (v) => D.provinces.find(p => p.id === v || p.zh === v)?.id || v;
  const cityKey = (v) => D.cities.find(c => c.id === v || c.zh === v)?.id || v;
  const cityName = (v) => cityById[v]?.zh || v || '城市待核实';
  const provinceName = (v) => provById[v]?.zh || v || '';
  const safeURL = (v) => { try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? esc(u.href) : ''; } catch { return ''; } };
  const outLink = (url, label, cls = '') => safeURL(url) ? `<a class="${cls}" href="${safeURL(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
  const shopHref = (s) => '#shop/' + encodeURIComponent(s.id);
  const statusText = (s) => ({corroborated:'地址有交叉资料',comment_only:'地址来自评论，待复核',unresolved:'地址待核实'}[s.address_status] || '地址待核实');
  const hasPoint = (s) => s.location && Number.isFinite(s.location.lat) && Number.isFinite(s.location.lon) && Math.abs(s.location.lat) <= 90 && Math.abs(s.location.lon) <= 180;
  const precisionText = (s) => !hasPoint(s) ? '尚未定位' : ({poi:'店铺位置',street:'街道范围示意',area:'区域范围示意'}[s.location.precision] || '范围示意');
  function shopLinksForDish(id) {
    const ss = shops().filter(s => (s.dish_ids || []).includes(id));
    if (ss.length) return `<div class="atlas-related"><h4 class="subhead">去这家店</h4>${ss.map(s => `<a href="${shopHref(s)}">${esc(s.name)} · 地址与位置 →</a>`).join('')}</div>`;
    const context = (D.non_public_food || []).find(x => (x.dish_ids || []).includes(id));
    return context ? `<div class="atlas-related"><h4 class="subhead">非对外餐馆场景</h4><p>${esc(context.reason)}</p></div>` : '';
  }
  function shopLinksForCity(id) {
    const count = shops().filter(s => cityKey(s.city) === id).length;
    return count ? `<div class="atlas-city-entry"><span>把这一城的好吃，变成下一站。</span><a href="#shops" data-shop-city-go="${esc(id)}">查看 ${count} 条店铺与摊位档案 →</a></div>` : '';
  }
  function shopCard(s) {
    const ds = (s.dish_ids || []).map(id => dishById[id]).filter(Boolean);
    const image = ds.find(d=>d.img)?.img || ((s.videos || []).find(id=>byId[id]) ? yt(s.videos.find(id=>byId[id]),'hqdefault') : '');
    return `<a class="atlas-shop-card" href="${shopHref(s)}"><div class="atlas-card-image">${image?`<img src="${esc(image)}" alt="相关视频画面" loading="lazy">`:`<span class="atlas-card-place">${esc(cityName(s.city))}</span>`}<span class="atlas-card-city">${esc(cityName(s.city))}</span></div><div class="atlas-card-copy"><h3>${esc(s.name)}</h3><p>${esc(ds.map(d => d.zh).join(' · ') || (s.menu_notes || [])[0] || '街巷里的一站')}</p><div class="atlas-card-address">${esc(s.address || '具体地址待核实')}</div><div class="atlas-card-foot"><span>${statusText(s)}</span><b>去看看 →</b></div></div></a>`;
  }
  function renderShops() {
    const ps = [...new Set(shops().map(s => provinceKey(s.province)))].sort((a,b) => PROV_ORDER.indexOf(a)-PROV_ORDER.indexOf(b));
    const inProvince = shops().filter(s => shopState.province === 'all' || provinceKey(s.province) === shopState.province);
    const cs = [...new Set(inProvince.map(s => cityKey(s.city)))].sort((a,b) => (a === 'zunyi' ? -1 : b === 'zunyi' ? 1 : cityName(a).localeCompare(cityName(b),'zh-CN')));
    $('#shop-provinces').innerHTML = ['all',...ps].map(p => `<button type="button" data-shop-province="${esc(p)}" aria-pressed="${p===shopState.province}">${p==='all'?'全部省份':esc(provinceName(p))}</button>`).join('');
    $('#shop-cities').innerHTML = ['all',...cs].map(c => `<button type="button" data-shop-city="${esc(c)}" aria-pressed="${c===shopState.city}">${c==='all'?'全部城市':esc(cityName(c))}</button>`).join('');
    const q = shopState.q.trim().toLowerCase();
    const candidates = inProvince.filter(s => (shopState.city === 'all' || cityKey(s.city) === shopState.city) && (!q || [s.name,s.address,cityName(s.city),...(s.menu_notes||[]),...(s.dish_ids||[]).map(id=>dishById[id]?.zh)].join(' ').toLowerCase().includes(q)));
    const statuses = [['all','全部'],['corroborated','地址有交叉资料'],['comment_only','评论指路'],['unresolved','待核实']];
    const statusKey = s => ['corroborated','comment_only'].includes(s.address_status) ? s.address_status : 'unresolved';
    $('#shop-status').innerHTML = statuses.map(([key,label]) => `<button type="button" data-shop-status="${key}" aria-pressed="${shopState.status===key}">${label}<small>${key==='all'?candidates.length:candidates.filter(s=>statusKey(s)===key).length}</small></button>`).join('');
    const reliability = {corroborated:0,comment_only:1,unresolved:2};
    const list = candidates.filter(s => shopState.status === 'all' || statusKey(s) === shopState.status).sort((a,b) =>
      (cityKey(a.city)==='zunyi'?-1:0)-(cityKey(b.city)==='zunyi'?-1:0) ||
      PROV_ORDER.indexOf(provinceKey(a.province))-PROV_ORDER.indexOf(provinceKey(b.province)) ||
      cityName(a.city).localeCompare(cityName(b.city),'zh-CN') ||
      reliability[statusKey(a)]-reliability[statusKey(b)]);
    const displayed = list.slice(0, shopState.visible);
    $('#shop-count').textContent = `显示 ${displayed.length} / ${list.length} 条店铺或摊位档案 · 同城优先展示地址有交叉资料的地点`;
    $('#shop-list').innerHTML = list.length ? displayed.map(shopCard).join('') : `<div class="atlas-empty"><h3>${shops().length?'暂时没有匹配的店铺':'店铺地址正在整理'}</h3><p>${shops().length?'试试其他核实程度、关键词或城市。':'目前可先浏览下方城市、菜品与原视频；核实后的店铺会出现在这里。'}</p><button type="button" data-shop-reset>清除筛选，查看全部档案</button></div>`;
    $('#shop-pagination').innerHTML = displayed.length < list.length ? `<p>还有 ${list.length-displayed.length} 条符合条件的档案</p><div><button type="button" data-shop-more>再显示 ${Math.min(12,list.length-displayed.length)} 条 ↓</button><button type="button" data-shop-all>查看全部 ${list.length} 条</button></div>` : list.length ? '<p>已显示当前筛选下的全部档案</p>' : '';
    const gz = shops().filter(s=>provinceKey(s.province)==='guizhou'), zy=gz.filter(s=>cityKey(s.city)==='zunyi');
    $('#shop-progress').innerHTML=`<span><b>贵州 ${gz.length}</b> 条已建档</span><span><b>遵义 ${zy.length}</b> 条店铺线索</span><span><b>${shops().filter(s=>s.address_status==='corroborated').length}</b> 条地址有交叉资料</span><span>建档不等于营业确认 · 出发前再核对</span>`;
  }
  function relativeMap(s) {
    if (!hasPoint(s)) return `<div class="atlas-no-map"><span>位置待核实</span><p>这家店还没有可靠坐标，因此暂不在地图上落点。</p><p>${esc(s.address || '具体地址待补充')}</p></div>`;
    const peers = shops().filter(x => x.id===s.id || (cityKey(x.city)===cityKey(s.city) && hasPoint(x)));
    const cos=Math.cos(s.location.lat*Math.PI/180), xy=x=>[(x.location.lon-s.location.lon)*111.32*cos,(x.location.lat-s.location.lat)*110.57];
    const pts=peers.map(x=>({s:x,p:xy(x)}));
    const xs=pts.map(x=>x.p[0]), ys=pts.map(x=>x.p[1]);
    const xmin=Math.min(-.5,...xs), xmax=Math.max(.5,...xs), ymin=Math.min(-.5,...ys), ymax=Math.max(.5,...ys);
    const scale=Math.min(540/(xmax-xmin),290/(ymax-ymin)); const cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;
    const dot=(p)=>[330+(p[0]-cx)*scale,205-(p[1]-cy)*scale];
    const marks=pts.map(({s:x,p},i)=>{const [a,b]=dot(p),exact=x.location.precision==='poi',sel=x.id===s.id;return `<a href="${shopHref(x)}" aria-label="${esc(x.name)}，${precisionText(x)}"><circle cx="${a}" cy="${b}" r="${exact?14:30}" class="${exact?'atlas-pin':'atlas-area'} ${sel?'selected':''}"></circle><text x="${a}" y="${b+5}" text-anchor="middle">${i+1}</text></a>`}).join('');
    const bar=Math.pow(10,Math.floor(Math.log10(120/scale))),length=bar*scale;
    return `<div class="atlas-position-map"><svg viewBox="0 0 660 410" role="img" aria-label="${esc(cityName(s.city))}店铺相对位置示意，北向上"><defs><pattern id="shop-grid" width="44" height="41" patternUnits="userSpaceOnUse"><path d="M44 0H0V41" fill="none" stroke="currentColor" stroke-opacity=".08"/></pattern></defs><rect width="660" height="410" fill="url(#shop-grid)"/><text x="25" y="32" class="atlas-map-caption">${esc(cityName(s.city))} · 相对位置示意</text><text x="615" y="32">北 ↑</text>${marks}<path d="M25 365v7h${length}v-7" class="atlas-scale"/><text x="25" y="395" class="atlas-map-caption">${bar>=1?bar+' 公里':Math.round(bar*1000)+' 米'}</text></svg></div><p class="atlas-map-note">实心编号表示店铺点位，虚线大圈表示街道或区域范围。此图用于比较方位与直线距离，不是道路导航。</p><ol class="atlas-map-key">${pts.map(({s:x},i)=>`<li><a href="${shopHref(x)}"><b>${i+1}</b>${esc(x.name)}</a><span>${precisionText(x)}</span></li>`).join('')}</ol>${s.location.note?`<p class="muted">位置说明：${esc(s.location.note)}</p>`:''}`;
  }
  function appLink(provider, url, label) {
    if (!safeURL(url)) return '';
    const link = AppLinks.build(provider,url);
    if (!link) return outLink(url,label);
    return `<span class="atlas-app-action"><a class="atlas-app-link ${provider==='amap'?'atlas-primary':''}" data-app-provider="${provider}" data-app-web="${safeURL(link.webUrl)}" href="${esc(link.href)}" ${link.target ? `target="${esc(link.target)}"` : ''} rel="noopener">${esc(label)} ↗</a>${link.mode!=='web'?`<a class="atlas-web-fallback" href="${safeURL(link.webUrl)}" target="_blank" rel="noopener">网页版</a>`:''}</span>`;
  }
  function storeEmbed(id,t=0,autoplay=false) {
    return `<iframe id="store-embed" src="${esc(StoreMedia.embedURL(id,t,autoplay,location.origin))}" title="${esc(byId[id]?.title_zh || 'YouTube 原视频')}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>`;
  }
  function setStoreVideo(id,t=0,autoplay=false) {
    if (!byId[id] || !$('#store-embed')) return;
    $('#store-embed').outerHTML=storeEmbed(id,t,autoplay);
    $('#store-video-title').textContent=byId[id].title_zh;
    $('#store-video-external').href=`https://www.youtube.com/watch?v=${id}&t=${Math.max(0,Math.round(t||0)-1)}s`;
    document.querySelectorAll('[data-store-video]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.storeVideo===id && Number(el.dataset.t)===Number(t))));
    $('#store-videos').scrollIntoView({behavior:smooth(),block:'start'});
  }
  let cleanupStoreMap = null;
  function renderShopPage(s) {
    const ds=(s.dish_ids||[]).map(id=>dishById[id]).filter(Boolean);
    const bs=(D.bilibili||[]).filter(v=>(s.bvids||[]).includes(v.bvid)||(v.shops||[]).includes(s.id));
    const bvIds=[...new Set([...(s.bvids||[]),...bs.map(v=>v.bvid)])];
    const segments=StoreMedia.segments(s,D.dishes,D.videos), first=segments[0];
    const photo=ds.find(d=>d.img)?.img || (first ? yt(first.video,'maxresdefault') : null);
    const menuNotes=s.menu_notes||[], voices=s.comment_voices||[];
    const navigation=appLink('amap',s.map_url,s.map_scope==='region'?'高德查看区域':'高德地图')+appLink('dianping',s.dianping_url,'大众点评');
    const title=s.name.match(/^([^（]+)(（.*)$/);
    const heading=title?esc(title[1])+`<small>${esc(title[2])}</small>`:esc(s.name);
    const sectionTitle=(n,eyebrow,title)=>`<header class="store-section-head"><span>${n}</span><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div></header>`;
    $('#shop-page').innerHTML=`<div class="wrap store-shell" style="--pc:${pcol(provinceKey(s.province))}">
      <div class="store-breadcrumb"><a href="#shops">← 找店铺</a><span>/</span><a href="#shops" data-shop-city-go="${esc(cityKey(s.city))}">${esc(cityName(s.city))}</a><span>/</span><span>这一家</span></div>
      <header class="city-banner store-banner ${photo?'':'store-banner-empty'}">
        ${photo?`<img src="${esc(photo)}" alt="${esc(s.name)}相关视频画面" fetchpriority="high">`:''}
        <div class="banner-in"><div class="sign-board">${esc(cityName(s.city))}</div><div class="banner-text"><p class="eyebrow">${esc(provinceName(s.province))} · 跟着盗月社找店</p><h1>${heading}</h1><p class="store-taste">${esc(ds.map(d=>d.zh).join(' · ')||'镜头走过的街巷，记下这一站。')}</p></div></div>
        ${photo?'<span class="store-photo-credit">盗月社相关视频画面</span>':''}
      </header>
      <nav class="store-nav" aria-label="本店详情"><button data-shop-jump="store-food"><i>01</i> 吃什么</button><button data-shop-jump="store-videos"><i>02</i> 看原片</button><button data-shop-jump="store-location"><i>03</i> 去哪里</button><button data-shop-jump="store-opinions"><i>04</i> 听评论</button></nav>
      <div class="store-layout">
        <section class="store-section store-food" id="store-food">${sectionTitle('01','先说这一口','到店吃什么')}
          ${ds.length?`<div class="dishes">${ds.map(d=>dishCard(d,false,s.id)).join('')}</div><p class="store-caption">价格为拍摄时价格；圆点代表主播在视频中的喜爱程度。</p>`:''}
          ${menuNotes.length?`<ul class="store-menu-notes">${menuNotes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
          ${!ds.length?'<p class="store-caption">此店尚无逐菜品的主播评分，先从原片与评论了解。</p>':''}
        </section>
        <section class="store-section store-video" id="store-videos">${sectionTitle('02','回到当时那一桌','直接看原片')}
          ${first?`<div class="store-player">${storeEmbed(first.video,first.start)}</div><div class="store-video-meta"><p id="store-video-title">${esc(first.title)}</p><a id="store-video-external" href="https://www.youtube.com/watch?v=${esc(first.video)}&amp;t=${Math.max(0,Math.round(first.start)-1)}s" target="_blank" rel="noopener">YouTube ↗</a></div>
            <div class="store-chapters" aria-label="播放片段">${segments.flatMap(v=>(v.items.length?v.items:[{t:0,zh:'从本期开始'}]).map((d,i)=>`<button type="button" data-store-video="${esc(v.video)}" data-t="${d.t}" aria-pressed="${v.video===first.video && d.t===first.start}"><span>▶ ${mmss(d.t)}</span>${esc(d.zh)}${segments.length>1?`<small> · 第 ${segments.indexOf(v)+1} 期</small>`:''}</button>`)).join('')}</div>`:'<p class="store-caption">这家店暂未匹配到 YouTube 版本，可从下方 B站原片查看。</p>'}
          ${bvIds.length?`<details class="store-bili"><summary>${first?'也在 B站看':'打开 B站原视频'} · ${bvIds.length} 期</summary><div class="atlas-related">${bvIds.map(id=>{const v=bs.find(x=>x.bvid===id);return outLink(v?.url||`https://www.bilibili.com/video/${id}/`,v?.title||'B站相关原视频');}).join('')}</div></details>`:''}
        </section>
        <section class="store-section store-location" id="store-location">${sectionTitle('03','地址带上，再出发','去哪里')}
          <p class="store-address">${esc(s.address||'具体地址待核实')}</p><p class="store-status" data-status="${esc(s.address_status)}">${statusText(s)}</p>
          ${StoreMap.render(s,{cities:D.cities,provinces:D.provinces,map:MAP})}
          ${s.relative_location?`<p class="store-relative">${esc(s.relative_location)}</p>`:''}
          <div class="atlas-actions">${navigation}</div>
          ${s.caveat?`<p class="store-caveat">${esc(s.caveat)}</p>`:''}
          ${hasPoint(s)?`<details class="store-evidence"><summary>同城方位与坐标说明</summary>${relativeMap(s)}</details>`:''}
        </section>
        <section class="store-section store-voices" id="store-opinions">${sectionTitle('04','保留评论者自己的话','评论区的声音')}
          <p class="store-caption">B站评论原文节选 · 个人经历与观点，含指路线索，不代表一致评价。</p>
          ${voices.length?`<div class="store-quote-grid">${voices.map(c=>`<figure class="q store-quote">${c.context?`<p class="store-quote-context">${esc(c.context)}</p>`:''}<blockquote>${esc(c.text)}</blockquote><figcaption><div><b>${esc(c.author)}</b><time>${esc(c.date||'')}</time></div>${outLink(c.url,c.url_precision==='video_comment_section'?'原视频评论区':'原评论')}</figcaption></figure>`).join('')}</div>`:`<div class="store-voice-empty"><p>这家店暂未找回可逐字核对的评论原文。</p><span>已有整理摘要保留在下方，原文核实后再补上。</span></div>`}
          ${(s.comment_summary||[]).length?`<details class="store-summary" ${voices.length?'':'open'}><summary>我们从评论里整理了什么</summary><ul>${s.comment_summary.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}
        </section>
      </div>
      <details class="store-evidence store-all-sources"><summary>资料来源与核对记录 <span>${(s.sources||[]).length} 条 · ${esc(s.checked||'')}</span></summary><ul>${(s.sources||[]).map(x=>`<li>${outLink(x.url,x.author||'原始来源')}${x.date?`<time>${esc(x.date)}</time>`:''}<p>${esc(x.note||'')}</p></li>`).join('')}</ul></details>
      <div class="store-end"><a href="#shops" data-shop-city-go="${esc(cityKey(s.city))}">继续逛${esc(cityName(s.city))}的店 →</a><a href="#cities">回到城市篇章</a></div>
    </div>`;
    cleanupStoreMap=StoreMap.mount($('#shop-page'));
  }
  function shopRoute() {
    cleanupStoreMap?.();cleanupStoreMap=null;
    const detail=location.hash.startsWith('#shop/'), directory=location.hash==='#shops';
    if (detail && !$('#directory-page').hidden) shopState.scroll=window.scrollY;
    $('#top').hidden=detail||directory;
    $('#directory-page').hidden=!directory;
    $('#shop-page').hidden=!detail;
    document.body.dataset.view=detail?'shop':directory?'directory':'home';
    if ($('#dish').open) $('#dish').close();
    closePlayer();
    if(detail){
      let id;try{id=decodeURIComponent(location.hash.slice(6));}catch{id='';}
      const s=shops().find(x=>x.id===id);
      if(s){renderShopPage(s);document.title=s.name+' · 红油地图';}
      else{$('#shop-page').innerHTML='<div class="wrap store-shell"><h1>还没有这家店的资料</h1><a href="#shops">返回店铺目录 →</a></div>';}
      window.scrollTo({top:0,behavior:'instant'});$('#shop-page').focus({preventScroll:true});
    }else{
      $('#shop-page').innerHTML='';
      document.title=directory?'找店铺 · 红油地图':'红油地图';
      requestAnimationFrame(()=>{if(directory)window.scrollTo({top:shopState.scroll,behavior:'instant'});else document.getElementById(location.hash.slice(1)||'top')?.scrollIntoView();});
    }
  }
  function initShops() {
    if (!shops().some(s=>provinceKey(s.province)==='guizhou')) shopState.province='all';
    renderShops();
    $('#shop-search').addEventListener('input',e=>{shopState.q=e.target.value;shopState.visible=12;renderShops();});
    document.addEventListener('click',e=>{
      const app=e.target.closest('[data-app-provider]');
      if(app){AppLinks.handleClick(e,AppLinks.build(app.dataset.appProvider,app.dataset.appWeb));return;}
      const chapter=e.target.closest('[data-store-video]');
      if(chapter){setStoreVideo(chapter.dataset.storeVideo,Number(chapter.dataset.t),true);return;}
      const cityEntry=e.target.closest('[data-shop-city-go]');
      if(cityEntry){shopState.province=cityById[cityEntry.dataset.shopCityGo]?.province||'all';shopState.city=cityEntry.dataset.shopCityGo;shopState.q='';shopState.status='all';shopState.visible=12;shopState.scroll=0;$('#shop-search').value='';renderShops();if(location.hash==='#shops')window.scrollTo({top:0,behavior:smooth()});}
      const jump=e.target.closest('[data-shop-jump]');
      if(jump){document.getElementById(jump.dataset.shopJump)?.scrollIntoView({behavior:smooth()});return;}
      const p=e.target.closest('[data-shop-province]'), c=e.target.closest('[data-shop-city]'), st=e.target.closest('[data-shop-status]');
      if(p){shopState.province=p.dataset.shopProvince;shopState.city='all';shopState.visible=12;renderShops();}
      if(c){shopState.city=c.dataset.shopCity;shopState.visible=12;renderShops();}
      if(st){shopState.status=st.dataset.shopStatus;shopState.visible=12;renderShops();}
      if(e.target.closest('[data-shop-more], [data-shop-all]')){
        const previous=$('#shop-list').children.length;
        shopState.visible=e.target.closest('[data-shop-all]')?Number.MAX_SAFE_INTEGER:shopState.visible+12;
        renderShops();$('#shop-list').children[previous]?.focus({preventScroll:true});
      }
      if(e.target.closest('[data-shop-reset]')){shopState.province='all';shopState.city='all';shopState.status='all';shopState.q='';shopState.visible=12;$('#shop-search').value='';renderShops();}
    });
    window.addEventListener('hashchange',shopRoute);shopRoute();
  }

  async function boot() {
    [D, MAP] = await Promise.all([fetch(DATA_BASE + 'data/site.json?v=design-20261018c').then((r) => r.json()), fetch(DATA_BASE + 'data/map.json').then((r) => r.json())]);
    D.videos.forEach((v) => (byId[v.id] = v));
    D.provinces.forEach((p) => (provById[p.id] = p));
    D.dishes.forEach((d) => (dishById[d.id] = d));
    D.cities.forEach((c) => {
      cityById[c.id] = c;
      c._n = D.dishes.filter((d) => d.city === c.id).length;
      const vs = (c.videos || []).map((id) => byId[id]).filter(Boolean).sort((a, b) => (b.views || 0) - (a.views || 0));
      c._lead = vs[0]?.id;
    });
    wire(); renderAll(); initShops();
    if (location.hash.startsWith('#city-')) setTimeout(() => goCity(location.hash.slice(6)), 80);
  }
  boot().catch((err) => {
    console.error(err);
    document.querySelector('main').insertAdjacentHTML('afterbegin', `<p class="wrap" style="padding:24px 20px;color:var(--chili)">数据没有加载出来（${esc(err.message)}），请刷新页面重试。</p>`);
  });
})();
