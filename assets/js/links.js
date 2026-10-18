/* Outbound map / review links and clipboard. Every outbound link opens a new page,
 * so returning to the guide never reloads it or loses the place in a list. */
import { esc, safeURL } from './core.js';

const ios = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Amap web URI. callnative=1 lets the Amap page offer to hand off to the app
 * from its own (new) tab instead of us redirecting this one.
 * https://lbs.amap.com/api/uri-api/guide/search/search */
export function amapURL(raw) {
  const href = safeURL(raw);
  if (!href) return '';
  const url = new URL(href);
  if (url.hostname !== 'uri.amap.com') return '';
  url.protocol = 'https:';
  url.searchParams.set('callnative', '1');
  url.searchParams.set('src', 'red-oil-atlas');
  return url.href;
}

/** Dianping shop page. On iOS a numeric shop id goes through Dianping's own
 * Universal Link (verified 2026-10-18 from m.dianping.com/shop/79584331), which
 * opens the app when installed and otherwise lands on the mobile web page. */
export function dianpingURL(raw) {
  const href = safeURL(raw);
  if (!href) return '';
  const url = new URL(href);
  if (!['dianping.com', 'www.dianping.com', 'm.dianping.com'].includes(url.hostname)) return '';
  const id = url.pathname.match(/^\/shop\/(\d+)\/?$/)?.[1];
  if (ios() && id) {
    const q = new URLSearchParams({ originalUrl: `https://m.dianping.com/shop/${id}`, schema: `dianping://shopinfo?id=${id}` });
    return `https://link.dianping.com/universal-link?${q}`;
  }
  return url.href;
}

export const ext = (href, inner, cls = '', extra = '') =>
  href ? `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer" ${extra}>${inner}</a>` : '';

export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
    document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

let toastTimer;
export function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    document.body.append(el);
  }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
