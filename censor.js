// Injected on every toolbar click. The first run censors the page, later runs toggle.
// The last expression is the new state: true (on), false (off), null (not reddit).
(() => {
  if (window.__redditCensor) return window.__redditCensor.toggle();
  if (!/(^|\.)reddit\.com$/.test(location.hostname)) return null;

  // Profile links only. Both old and new reddit use these for every username and avatar.
  const USER_PATH = /^\/(?:user|u)\/([^/]+)\/?$/;
  const MEDIA = 'img, svg, video, faceplate-img';
  const NAME = 'data-rc-user';

  const saved = new Map(); // element -> its style attribute before censoring
  const watched = new WeakSet();
  let active = false;
  let pending = false;

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (str.charCodeAt(i) + ((hash << 5) - hash)) | 0;
    }
    return hash;
  }

  // Hue from the hash, fixed saturation and lightness, so blocks show on light and dark themes.
  const colorFor = (name) => `hsl(${Math.abs(hashCode(name)) % 360} 70% 50%)`;

  function paint(el, props) {
    if (!saved.has(el)) saved.set(el, el.getAttribute('style'));
    for (const [prop, value] of Object.entries(props)) el.style.setProperty(prop, value, 'important');
  }

  function censor(link) {
    let name;
    try {
      name = new URL(link.href).pathname.match(USER_PATH)?.[1];
    } catch {
      return;
    }
    if (!name) return;
    name = decodeURIComponent(name).toLowerCase();
    if (link.getAttribute(NAME) === name) return;
    link.setAttribute(NAME, name);

    const color = colorFor(name);
    const text = { color, '-webkit-text-fill-color': color, 'text-shadow': 'none' };
    paint(link, { ...text, 'background-color': color, 'text-decoration': 'none' });
    for (const el of link.querySelectorAll('*')) {
      paint(el, el.matches(MEDIA) ? { visibility: 'hidden' } : text);
    }
  }

  const shadowOf = (el) => globalThis.chrome?.dom?.openOrClosedShadowRoot?.(el) ?? el.shadowRoot;

  function scan(root) {
    if (!watched.has(root)) {
      watched.add(root);
      observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    }
    for (const link of root.querySelectorAll('a[href]')) censor(link);
    for (const el of root.querySelectorAll('*')) {
      const shadow = shadowOf(el);
      if (shadow) scan(shadow);
    }
  }

  // Reddit loads comments as you scroll, so rescan on any change while active.
  const observer = new MutationObserver(() => {
    if (!active || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (active) scan(document);
    });
  });

  function restore() {
    for (const [el, style] of saved) {
      if (style === null) el.removeAttribute('style');
      else el.setAttribute('style', style);
      el.removeAttribute(NAME);
    }
    saved.clear();
  }

  function toggle() {
    active = !active;
    if (active) scan(document);
    else restore();
    return active;
  }

  window.__redditCensor = { toggle };
  return toggle();
})();
