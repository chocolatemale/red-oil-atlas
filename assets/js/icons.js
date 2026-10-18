/* Inline stroke icons (currentColor). */
const svg = (d, extra = '') => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" ${extra}>${d}</svg>`;
export const icon = {
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  shop: svg('<path d="M4 10v10h16V10"/><path d="M3 10l2-6h14l2 6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>'),
  map: svg('<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>'),
  bowl: svg('<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5"/>'),
  city: svg('<path d="M3 21h18M5 21V8l6-4v17M11 21V10h8v11"/>'),
  play: svg('<path d="M8 5v14l11-7z"/>', 'data-fill'),
  chevron: svg('<path d="M9 6l6 6-6 6"/>'),
  back: svg('<path d="M15 6l-6 6 6 6"/>'),
  copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
  share: svg('<path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),
  nav: svg('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  star: svg('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'),
  film: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4.5-2.5z"/>'),
  tip: svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>'),
  expand: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>')
};
