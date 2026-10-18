import { db, esc, shops, sortShops, status, statusKey, mark, legend, STATUS, cityShort, provName, shopHref, shopThumb, shopDishes, thumb, shopText, debounce, realCities, PROV_ORDER } from '../core.js';
import { icon } from '../icons.js';
import { setParams } from '../nav.js';

export function shopRow(s) {
  const ds = shopDishes(s);
  const sub = ds.length ? ds.map((d) => d.zh + (d.price_cny ? ` ¥${d.price_cny}` : '')).join(' · ') : (s.menu_notes?.[0]?.split('：')[0] || '原片和评论线索');
  return `<li><a class="shop-row" href="${shopHref(s)}">
    ${thumb(shopThumb(s), cityShort(s.city))}
    <span class="shop-row-text">
      <strong>${esc(s.name)}</strong>
      <span class="muted one-line">${esc(sub)}</span>
      <span class="row-status" data-status="${statusKey(s)}">${mark(statusKey(s))}${status(s).short} · ${esc(cityShort(s.city))}</span>
    </span>${icon.chevron}</a></li>`;
}

export default function shopsView(params) {
  const st = {
    p: params.get('p') || 'all', city: params.get('city') || 'all', status: params.get('st') || 'all', q: params.get('q') || ''
  };
  if (st.city !== 'all' && db.city[st.city]) st.p = db.city[st.city].province;
  const provs = PROV_ORDER.filter((p) => shops().some((s) => s.province === p));

  return {
    name: 'shops', tab: 'shops', title: '找店铺',
    html: `<div class="page-head sticky-head">
      <div class="wrap">
        <div class="title-row"><h1 class="h1">找店铺</h1><span class="muted">${provs.map((p) => `${provName(p)} ${shops().filter((s) => s.province === p).length}`).join(' · ')}</span></div>
        <label class="search-box slim" for="shop-q">${icon.search}<span class="sr">搜索店铺</span>
          <input id="shop-q" type="search" placeholder="店名、菜名、街道" value="${esc(st.q)}" autocomplete="off" enterkeyhint="search"></label>
        <div class="filter-grid">
          <div class="seg" role="group" aria-label="省份" data-seg="p">
            ${['all', ...provs].map((p) => `<button type="button" data-v="${p}">${p === 'all' ? '全部' : esc(provName(p))}</button>`).join('')}
          </div>
          <div class="chips" role="group" aria-label="城市" data-chips="city"></div>
          <div class="filter-foot">
            <label class="select-chip"><span class="sr">地址核实程度</span>
              <select data-select="st">
                <option value="all">地址：全部</option>
                ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${v.short}</option>`).join('')}
              </select></label>
            <div class="seg seg-sm" role="group" aria-label="显示方式">
              <button type="button" aria-pressed="true">${icon.list} 列表</button>
              <a href="#/map" data-map-link>${icon.map} 地图</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="wrap">
      <p class="muted count" aria-live="polite" data-count></p>
      <ul class="shop-list" data-list></ul>
      <p class="fine legend">${legend()}<span>建档不等于今天还在营业，出发前再核对。</span></p>
    </div>`,
    mount(root) {
      const q = root.querySelector('#shop-q');
      const draw = () => {
        const inProv = shops().filter((s) => st.p === 'all' || s.province === st.p);
        const cities = realCities(st.p).map((c) => c.id).concat(['guizhou-other', 'yunnan-other', 'yunnan-border']).filter((id) => inProv.some((s) => s.city === id));
        if (st.city !== 'all' && !cities.includes(st.city)) st.city = 'all';
        root.querySelector('[data-chips="city"]').innerHTML = ['all', ...cities].map((c) => `<button type="button" class="chip" data-v="${esc(c)}" aria-pressed="${c === st.city}">${c === 'all' ? '全部城市' : esc(cityShort(c))} <small>${c === 'all' ? inProv.length : inProv.filter((s) => s.city === c).length}</small></button>`).join('');
        root.querySelectorAll('[data-seg="p"] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === st.p)));
        root.querySelector('[data-select="st"]').value = st.status;
        const needle = st.q.trim().toLowerCase();
        const list = sortShops(inProv.filter((s) => (st.city === 'all' || s.city === st.city) &&
          (st.status === 'all' || statusKey(s) === st.status) && (!needle || shopText(s).includes(needle))));
        const where = st.city !== 'all' ? cityShort(st.city) : st.p !== 'all' ? provName(st.p) : '全部';
        root.querySelector('[data-count]').textContent = `${where} ${list.length} 家${st.status !== 'all' ? ' · ' + STATUS[st.status].short : ''}${needle ? ` · 含“${st.q.trim()}”` : ''} · 地址核得越实排越前`;
        root.querySelector('[data-list]').innerHTML = list.length ? list.map(shopRow).join('')
          : `<li class="empty"><p>没有符合条件的店。</p><button type="button" class="btn" data-reset>清除筛选</button></li>`;
        root.querySelector('[data-map-link]').setAttribute('href', '#/map' + (st.city !== 'all' ? '?city=' + st.city : st.p !== 'all' ? '?p=' + st.p : ''));
        setParams({ p: st.p === 'all' ? '' : st.p, city: st.city === 'all' ? '' : st.city, st: st.status === 'all' ? '' : st.status, q: st.q.trim() });
      };
      root.addEventListener('click', (e) => {
        const seg = e.target.closest('[data-seg="p"] button');
        if (seg) { st.p = seg.dataset.v; st.city = 'all'; draw(); return; }
        const chip = e.target.closest('[data-chips="city"] button');
        if (chip) { st.city = chip.dataset.v; draw(); chip.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); return; }
        if (e.target.closest('[data-reset]')) { st.p = 'all'; st.city = 'all'; st.status = 'all'; st.q = ''; q.value = ''; draw(); }
      });
      root.querySelector('[data-select="st"]').addEventListener('change', (e) => { st.status = e.target.value; draw(); });
      const typed = debounce(() => { st.q = q.value; draw(); }, 180);
      q.addEventListener('input', typed);
      draw();
      return () => typed.cancel();
    }
  };
}
