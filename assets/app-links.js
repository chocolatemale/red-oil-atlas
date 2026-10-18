/* Red Oil Atlas · user-initiated iOS app links, with website fallbacks. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AppLinks = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const pending = new WeakMap();
  const HOSTS = { amap: ['uri.amap.com'], dianping: ['dianping.com', 'www.dianping.com', 'm.dianping.com'] };

  /** Pure builder. context may be a navigator-shaped object for deterministic tests.
   * Render href/target as a real anchor; keep webUrl available as a separate web link.
   * No URL is fetched, app opened, timer started, or install check attempted here.
   */
  function build(provider, input, context) {
    let url;
    try { url = new URL(input); } catch (_) { return null; }
    if (!HOSTS[provider]?.includes(url.hostname) || !/^https?:$/.test(url.protocol) || url.username || url.password || url.port) return null;
    url.protocol = 'https:';
    const nav = context || root.navigator || {};
    const ios = /iPhone|iPad|iPod/i.test(nav.userAgent || '') || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
    const result = { provider, href: url.href, webUrl: url.href, mode: 'web', target: ios ? '_self' : '_blank', reason: ios ? 'unsupported-path' : 'website' };

    if (provider === 'amap' && /^\/search\/?$/.test(url.pathname)) {
      // Official web URI fallback must not loop back into another app-open attempt.
      // https://lbs.amap.com/api/uri-api/guide/search/search
      url.searchParams.set('callnative', '0');
      result.href = result.webUrl = url.href;
      const keyword = (url.searchParams.get('keyword') || '').trim();
      if (ios && keyword) {
        // Official iOS POI search permits omitting all coordinates. A city is part
        // of the text query because this scheme has no documented city parameter.
        // https://lbs.amap.com/api/amap-mobile/guide/ios/search
        const city = (url.searchParams.get('city') || '').trim();
        const cityText = city.replace(/市$/, '');
        const name = cityText && !/^\d+$/.test(city) && !keyword.includes(cityText) ? `${city} ${keyword}` : keyword;
        const query = new URLSearchParams({ sourceApplication: '红油地图', name });
        result.href = `iosamap://poi?${query.toString().replace(/\+/g, '%20')}`;
        result.mode = 'scheme';
        result.reason = 'ios-keyword-search';
      }
    }

    if (provider === 'dianping' && ios) {
      const match = url.pathname.match(/^\/shop\/([A-Za-z0-9]+)\/?$/);
      if (match && /^\d+$/.test(match[1])) {
        // Verified on 2026-10-18 from Dianping's own public mobile shop HTML:
        // https://m.dianping.com/shop/79584331 (openURL and photo_link_ios).
        // https://link.dianping.com/.well-known/apple-app-site-association
        // associates /universal-link with com.dianping.dpscope. The HTTP endpoint
        // also redirects to originalUrl when the OS does not hand it to the app.
        const query = new URLSearchParams({
          originalUrl: `https://m.dianping.com/shop/${match[1]}`,
          schema: `dianping://shopinfo?id=${match[1]}`
        });
        result.href = `https://link.dianping.com/universal-link?${query}`;
        result.mode = 'universal';
        result.reason = 'ios-numeric-shop';
      } else if (match) {
        // A hashed web shop ID is not a verified numeric scheme ID. Preserve it.
        result.reason = 'unverified-shop-id';
      }
    }
    return result;
  }

  /** Call directly in the anchor's click listener (no await or timer before it).
   * true means handled; false leaves ordinary anchor behavior intact.
   * Only the iOS custom scheme needs a timed website fallback. Universal Links
   * remain native HTTPS anchors so iOS can dispatch them itself.
   * Runtime injection keeps tests from navigating or launching installed apps.
   */
  function handleClick(event, link, runtime) {
    const win = runtime || root;
    if (!event || event.type !== 'click' || !event.isTrusted || event.defaultPrevented ||
        event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !link) return false;
    pending.get(win)?.();
    if (link.mode !== 'scheme') return false;
    const doc = win.document;
    if (!doc || doc.visibilityState === 'hidden') return false;

    event.preventDefault();
    let timer;
    const now = () => win.performance?.now ? win.performance.now() : Date.now();
    const started = now();
    const cancel = () => {
      win.clearTimeout(timer);
      doc.removeEventListener('visibilitychange', onVisibility);
      win.removeEventListener('pagehide', cancel);
      if (pending.get(win) === cancel) pending.delete(win);
    };
    const onVisibility = () => { if (doc.visibilityState === 'hidden') cancel(); };
    pending.set(win, cancel);
    doc.addEventListener('visibilitychange', onVisibility);
    win.addEventListener('pagehide', cancel);
    timer = win.setTimeout(() => {
      const visible = doc.visibilityState !== 'hidden';
      cancel();
      // A suspended browser can resume before dispatching visibility events.
      // Never run an old fallback after the user has spent time in another app.
      if (visible && now() - started < 5000) win.location.assign(link.webUrl);
    }, 1800);
    try {
      // Synchronous navigation preserves the user's click activation.
      win.location.assign(link.href);
    } catch (_) {
      cancel();
      win.location.assign(link.webUrl);
    }
    return true;
  }

  return Object.freeze({ build, handleClick });
});
