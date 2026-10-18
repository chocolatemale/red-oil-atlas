import { db, esc, mmss, provName, cityShort, cityHref, shopHref, yt, out, PROV_ORDER } from '../core.js';
import { setParams } from '../nav.js';

export default function videosView(params) {
  const st = { p: params.get('p') || 'all' };
  const D = db.D;
  const provs = PROV_ORDER.filter((p) => D.videos.some((v) => v.province === p));
  const pendingBy = PROV_ORDER.map((p) => ({ p, list: (D.pending || []).filter((v) => v.province === p) })).filter((g) => g.list.length);

  return {
    name: 'videos', tab: 'videos', title: '视频',
    html: `<div class="wrap page-pad">
      <h1 class="h1">视频</h1>
      <p class="muted sec-sub">这个指南依据的 ${D.videos.length} 期，按时间倒序。2021–2023 年拍的，价格可能已经变了。</p>
      <div class="chips" role="group" aria-label="省份" data-chips="p">
        ${['all', ...provs].map((p) => `<button type="button" class="chip" data-v="${p}">${p === 'all' ? '全部' : esc(provName(p))}</button>`).join('')}
      </div>
      <ul class="video-list" data-list></ul>

      <section class="block">
        <h2 class="h2">B站补充资料</h2>
        <p class="muted sec-sub">读过评论、补了店名和地址的 B站版本。不等于逐句整理过视频。</p>
        <ul class="bili-list" data-bili></ul>
      </section>

      <section class="block">
        <h2 class="h2">还没整理的</h2>
        <p class="muted sec-sub">盗月社在西南拍的远不止这些。下面 ${D.pending.length} 期还没整理进来，没有评分，点开就是原视频。</p>
        ${pendingBy.map((g) => `<details class="more"><summary>${esc(provName(g.p))} · ${g.list.length} 期</summary>
          <ul class="plain-list">${g.list.map((v) => `<li>${out('https://www.youtube.com/watch?v=' + v.id, v.title_zh)} <span class="muted">${v.duration ? mmss(v.duration) : ''}</span></li>`).join('')}</ul></details>`).join('')}
      </section>
    </div>`,
    mount(root) {
      const draw = () => {
        root.querySelectorAll('[data-chips="p"] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === st.p)));
        const vs = D.videos.filter((v) => st.p === 'all' || v.province === st.p).sort((a, b) => (b.upload_date || '').localeCompare(a.upload_date || ''));
        root.querySelector('[data-list]').innerHTML = vs.map((v) => `<li><button type="button" class="video-row" data-play="${esc(v.id)}" data-t="0">
          <span class="thumb thumb-video"><img src="${esc(yt(v.id, 'mqdefault'))}" alt="" loading="lazy" data-fallback="视频"></span>
          <span><strong>${esc(v.title_zh)}</strong><span class="muted">${esc(cityShort(v.city))} · ${esc(v.upload_date || '')} · ${mmss(v.duration)}</span></span>
        </button></li>`).join('');
        const bs = (D.bilibili || []).filter((b) => st.p === 'all' || b.province === st.p);
        root.querySelector('[data-bili]').innerHTML = bs.map((b) => `<li class="card">
          <p class="kicker"><a href="${cityHref(b.city)}">${esc(cityShort(b.city))}</a>${b.review_status ? ' · ' + esc(b.review_status) : ''}</p>
          <strong>${esc(b.title)}</strong>
          ${b.notes ? `<p class="muted fine">${esc(Array.isArray(b.notes) ? b.notes.join('；') : b.notes)}</p>` : ''}
          <div class="link-row">${out(b.url, '去 B站看')}${(b.shops || []).map((id) => db.shop[id]).filter(Boolean).slice(0, 6).map((s) => `<a href="${shopHref(s)}">${esc(s.name.replace(/（.*$/, ''))}</a>`).join('')}</div>
        </li>`).join('');
        setParams({ p: st.p === 'all' ? '' : st.p });
      };
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-chips="p"] button');
        if (b) { st.p = b.dataset.v; draw(); }
      });
      draw();
    }
  };
}
