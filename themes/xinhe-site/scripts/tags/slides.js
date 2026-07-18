/**
 * slides.js
 * Embed a standalone HTML slide deck (served via skip_render under /slides/)
 * as a responsive 16:9 iframe with a fullscreen link.
 *
 * Usage: {% slides <url>, <title>, <en|zh> %}
 * Note: <title> must not contain commas (args are comma-separated).
 */

'use strict';

module.exports = ctx => function(args) {
  args = args.join(' ').split(',');
  const url = (args[0] || '').trim();
  const title = (args[1] || '').trim();
  const locale = (args[2] || 'en').trim();

  if (!url) {
    ctx.log.warn('slides: URL can NOT be empty.');
    return '';
  }

  const isChinese = locale.indexOf('zh') === 0;
  const openLabel = isChinese ? '全屏打开 ↗' : 'Open fullscreen ↗';
  const hint = isChinese ? '点击后用方向键翻页 · O 键总览' : 'Click, then arrow keys · O for overview';

  return `<figure class="slides-embed">
  <div class="slides-embed-frame">
    <iframe src="${url}" title="${title}" loading="lazy" allowfullscreen></iframe>
  </div>
  <figcaption class="slides-embed-bar">
    <span class="slides-embed-title">${title}</span>
    <span class="slides-embed-hint">${hint}</span>
    <a class="slides-embed-open" href="${url}" target="_blank" rel="noopener">${openLabel}</a>
  </figcaption>
</figure>`;
};
