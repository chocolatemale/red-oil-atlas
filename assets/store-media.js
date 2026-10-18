/* Shop media: only use timestamps attached to the shop's own dishes. */
(function (root) {
  'use strict';
  function segments(shop, dishes, videos) {
    const ids = new Set(shop.dish_ids || []);
    return [...new Set(shop.videos || [])].map(id => {
      const video = videos.find(v => v.id === id);
      if (!video) return null;
      const items = dishes.filter(d => ids.has(d.id) && d.video === id && Number.isFinite(d.t) && d.t >= 0).sort((a,b)=>a.t-b.t);
      return {video:id,title:video.title_zh,start:items[0]?.t || 0,items};
    }).filter(Boolean);
  }
  function embedURL(id, seconds = 0, autoplay = false, origin = '') {
    if (!/^[\w-]{11}$/.test(id)) return '';
    const start = Number.isFinite(Number(seconds)) ? Math.max(0, Math.round(Number(seconds)) - 1) : 0;
    const params = new URLSearchParams({start:String(start),autoplay:autoplay?'1':'0',rel:'0',playsinline:'1'});
    if (/^https?:\/\//.test(origin)) { try { params.set('origin',new URL(origin).origin); } catch {} }
    return 'https://www.youtube.com/embed/' + id + '?' + params;
  }
  const api = {segments,embedURL};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else root.StoreMedia=api;
})(typeof window !== 'undefined' ? window : this);
