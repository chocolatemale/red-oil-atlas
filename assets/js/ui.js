/* Bottom sheet (dish details, video player). The sheet takes a history entry,
 * so the phone's back gesture closes it instead of leaving the page. */
import { $, db, esc, mmss, CATS, cityName, priceFull, spice, dots, shopHref, out, yt } from './core.js';
import { icon } from './icons.js';

let pendingNav = null;
const sheet = () => $('#sheet');

export function openSheet(html, label, cls = '') {
  const dlg = sheet();
  $('#sheet-body').innerHTML = html;
  dlg.className = 'sheet ' + cls;
  dlg.setAttribute('aria-label', label);
  if (!dlg.open) {
    dlg.showModal();
    history.pushState({ ...(history.state || {}), sheet: true }, '');
  }
  $('#sheet-body').scrollTop = 0;
}

export function closeSheet(fromHistory = false) {
  const dlg = sheet();
  if (!dlg?.open) return;
  $('#sheet-body').innerHTML = ''; // stops any playing video
  dlg.close();
  if (!fromHistory && history.state?.sheet) history.back();
}

export function initSheet(onNavigate) {
  const dlg = sheet();
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(); });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close-sheet]')) { closeSheet(); return; }
    const a = e.target.closest('a[href^="#/"]');
    if (a) { // leave the sheet's history entry before navigating
      e.preventDefault();
      pendingNav = a.getAttribute('href');
      closeSheet();
      if (!history.state?.sheet) { const to = pendingNav; pendingNav = null; onNavigate(to); }
    }
  });
  window.addEventListener('popstate', () => {
    if (dlg.open && !history.state?.sheet) closeSheet(true);
    if (pendingNav && !history.state?.sheet) { const to = pendingNav; pendingNav = null; onNavigate(to); }
  });
}

export const isSheetEntry = () => !!history.state?.sheet;

const closeBtn = '<button type="button" class="sheet-x" data-close-sheet aria-label="关闭"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';

export function embedURL(id, seconds = 0, autoplay = true) {
  if (!/^[\w-]{11}$/.test(id)) return '';
  const start = Math.max(0, Math.round(Number(seconds) || 0) - 1);
  const q = new URLSearchParams({ start: String(start), autoplay: autoplay ? '1' : '0', rel: '0', playsinline: '1' });
  if (/^https?:/.test(location.origin)) q.set('origin', location.origin);
  return `https://www.youtube.com/embed/${id}?${q}`;
}
export const ytWatch = (id, t = 0) => `https://www.youtube.com/watch?v=${id}&t=${Math.max(0, Math.round(t || 0) - 1)}s`;
export const biliFor = (videoId) => (db.D.bilibili || []).find((b) => b.youtube_id === videoId);

export function iframe(id, t, autoplay = true) {
  const v = db.video[id];
  return `<iframe src="${esc(embedURL(id, t, autoplay))}" title="${esc(v?.title_zh || 'YouTube 视频')}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
}

export function videoLinks(id, t) {
  const b = biliFor(id);
  return `<div class="video-links">${out(ytWatch(id, t), '在 YouTube 打开')}${b ? out(b.url, 'B站版本') : ''}</div>${b ? '<p class="fine">YouTube 打不开时可以看 B站版本；B站的时间轴可能和这里不同。</p>' : ''}`;
}

export function openPlayer(id, t = 0, quote = null) {
  const v = db.video[id] || (db.D.pending || []).find((x) => x.id === id);
  const city = v?.city ? cityName(v.city) : '';
  openSheet(`${closeBtn}
    <div class="player">${iframe(id, t)}</div>
    <div class="sheet-pad">
      ${quote?.text ? `<blockquote class="quote-big">“${esc(quote.text)}”${quote.who ? `<cite>${esc(quote.who)}</cite>` : ''}</blockquote>` : ''}
      <p class="kicker">${esc(city)}${city ? ' · ' : ''}从 ${mmss(t)} 开始${v?.upload_date ? ' · ' + esc(v.upload_date) : ''}</p>
      <h2 class="sheet-title sm">${esc(v?.title_zh || '原视频')}</h2>
      ${videoLinks(id, t)}
    </div>`, '播放原视频', 'sheet-video');
}

export function dishSheetHTML(d) {
  const shops = db.shopsByDish[d.id] || [];
  const ctx = (db.D.non_public_food || []).find((x) => (x.dish_ids || []).includes(d.id));
  return `${closeBtn}
    <span class="sheet-img">${d.img ? `<img src="${esc(d.img)}" alt="" data-fallback="${esc(d.zh)}">` : ''}</span>
    <div class="sheet-pad">
      <p class="kicker" data-prov="${esc(d.province)}">${esc(cityName(d.city))} · ${esc(CATS[d.category] || '')}</p>
      <h2 class="sheet-title">${esc(d.zh)}</h2>
      ${d.pinyin ? `<p class="pinyin">${esc(d.pinyin)}</p>` : ''}
      <div class="facts"><span class="price-line">${priceFull(d)}</span>${spice(d.spice)}<span class="score" aria-label="主播评分 ${d.score}/5">主播评分 ${dots(d.score)}</span></div>
      <p>${esc(d.what_zh)}</p>
      <p class="verdict">${esc(d.verdict_zh)}</p>
      ${d.quote_zh ? `<button type="button" class="quote-btn" data-play="${esc(d.video)}" data-t="${d.t}" data-quote="${esc(d.quote_zh)}" data-who="主播">
        ${icon.play}<span><span>“${esc(d.quote_zh)}”</span><small>看这一段 · ${mmss(d.t)}</small></span></button>` : ''}
      ${shops.length ? `<div class="sheet-actions">${shops.map((s) => `<a class="btn btn-primary" href="${shopHref(s)}">去${esc(s.name.replace(/（.*$/, ''))}</a>`).join('')}</div>`
        : ctx ? `<p class="note-box">${esc(ctx.reason)}</p>` : `<p class="fine">${esc(d.place_zh || '')}</p>`}
    </div>`;
}

export function openDish(id) {
  const d = db.dish[id];
  if (d) openSheet(dishSheetHTML(d), d.zh, 'sheet-dish');
}

export const videoPoster = (id, q = 'hqdefault') => yt(id, q);
