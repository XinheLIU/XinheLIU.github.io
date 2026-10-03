/* Shared by Hexo and the browser so the initial page and live refresh agree. */
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else factory().mount(document);
})(function () {
  'use strict';
  /**
   * @typedef {{id: string, date: string, kind: 'created' | 'updated', title: string, url: string}} WritingEvent
   * @typedef {{events: WritingEvent[]}} WritingSnapshot
   */

  /** @param {Date | string} instant @returns {string} */
  function dayKey(instant) {
    return new Date(new Date(instant).getTime() + 8 * 3600000).toISOString().slice(0, 10);
  }

  /** @param {Date} now @returns {{start: string, end: string}} */
  function windowDates(now) {
    var end = dayKey(now);
    var start = new Date(end + 'T00:00:00Z');
    var day = start.getUTCDate();
    start.setUTCDate(1);
    start.setUTCMonth(start.getUTCMonth() - 6);
    var lastDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
    start.setUTCDate(Math.min(day, lastDay));
    return { start: start.toISOString().slice(0, 10), end: end };
  }

  /** @param {WritingSnapshot} snapshot @param {Date} now */
  function summarize(snapshot, now) {
    var range = windowDates(now);
    var events = snapshot.events.filter(function (event) { return event.date >= range.start && event.date <= range.end; });
    /** @type {Map<string, number>} */
    var counts = new Map();
    events.forEach(function (event) { counts.set(event.date, (counts.get(event.date) || 0) + 1); });
    return { start: range.start, end: range.end, events: events, counts: counts,
      activeDays: counts.size, created: events.filter(function (event) { return event.kind === 'created'; }).length,
      updated: events.filter(function (event) { return event.kind === 'updated'; }).length };
  }

  /** @param {string} value @returns {string} */
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  /** @param {WritingSnapshot} snapshot @param {boolean} isChinese @param {Date} [now] @returns {string} */
  function render(snapshot, isChinese, now) {
    now = now || new Date();
    var heading = '<h2 class="contribution-title">' + (isChinese ? '写作足迹' : 'Writing activity') + '</h2>';
    var summary = summarize(snapshot, now);
    var date = new Date(summary.start + 'T00:00:00Z');
    // Monday-aligned columns; padding is not a dated activity cell.
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    var columns = [];
    var months = isChinese ? ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'] :
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    while (date.toISOString().slice(0, 10) <= summary.end) {
      var cells = [];
      var label = '';
      for (var weekday = 0; weekday < 7; weekday++) {
        var key = date.toISOString().slice(0, 10);
        if (key >= summary.start && key <= summary.end) {
          if (date.getUTCDate() === 1 || key === summary.start) label = months[date.getUTCMonth()];
          var count = summary.counts.get(key) || 0;
          var level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
          var detail = key + ' · ' + count + (isChinese ? ' 次写作' : count === 1 ? ' writing event' : ' writing events');
          cells.push('<span class="contribution-cell level-' + level + '" data-date="' + key +
            '" data-count="' + count + '" tabindex="0" role="img" aria-label="' + detail + '" title="' + detail + '"></span>');
        } else cells.push('<span class="contribution-padding" aria-hidden="true"></span>');
        date.setUTCDate(date.getUTCDate() + 1);
      }
      columns.push('<div class="contribution-column"><span class="activity-month">' + label + '</span>' + cells.join('') + '</div>');
    }
    var stats = isChinese ? summary.activeDays + ' 个写作日 · ' + summary.created + ' 篇创作 · ' + summary.updated + ' 次更新' :
      summary.activeDays + (summary.activeDays === 1 ? ' writing day · ' : ' writing days · ') + summary.created +
      (summary.created === 1 ? ' piece created · ' : ' pieces created · ') + summary.updated + (summary.updated === 1 ? ' update' : ' updates');
    var recent = [];
    var seen = new Set();
    summary.events.forEach(function (event) {
      if (seen.has(event.id) || recent.length >= 5) return;
      seen.add(event.id);
      recent.push(event);
    });
    var items = recent.map(function (event) {
      var label = event.kind === 'created' ? (isChinese ? '创作' : 'Created') : (isChinese ? '更新' : 'Updated');
      return '<li><time datetime="' + event.date + '">' + event.date + '</time><div><span class="activity-repo">' +
        label + '</span><a href="' + escapeHtml(event.url) + '">' + escapeHtml(event.title) + '</a></div></li>';
    });
    return heading + '<p class="activity-summary">' + stats + '</p>' +
      '<p class="contribution-note">' + summary.start + ' → ' + summary.end + '</p>' +
      '<div class="contribution-graph" role="group" aria-label="' + (isChinese ? '每日写作记录' : 'Daily writing activity') + '">' + columns.join('') + '</div>' +
      '<div class="contribution-legend"><span>' + (isChinese ? '少' : 'Less') + '</span>' +
      [0,1,2,3,4].map(function (level) { return '<span class="contribution-cell level-' + level + '" aria-hidden="true"></span>'; }).join('') +
      '<span>' + (isChinese ? '多' : 'More') + '</span></div>' +
      '<p class="contribution-note">' + (isChinese ? '博客、笔记与书稿，按原始创作和更新日期记录。' : 'Essays, notes, and book chapters, dated by their original creation and revision.') + '</p>' +
      '<h3 class="activity-recent-title">' + (isChinese ? '这段时间的写作' : 'Writing in this period') + '</h3>' +
      (items.length ? '<ul class="activity-recent">' + items.join('') + '</ul>' : '<p>' + (isChinese ? '这段时间暂无写作记录。' : 'No writing recorded in this period.') + '</p>');
  }

  /** @param {Document} document @param {Date} [now] */
  function mount(document, now) {
    now = now || new Date();
    var panel = document.querySelector('[data-writing-activity]');
    if (!panel) return;
    var snapshot = JSON.parse(document.getElementById('writing-activity-snapshot').textContent);
    var isChinese = panel.getAttribute('data-locale') === 'zh-CN';
    var end = dayKey(now);
    var today = end;
    var earliest = snapshot.events.map(function (event) { return event.date; }).sort()[0] || today;
    var previous = document.querySelector('[data-writing-previous]');
    var next = document.querySelector('[data-writing-next]');
    var latest = document.querySelector('[data-writing-latest]');
    var ends = [];
    function update() {
      var reference = new Date(end + 'T00:00:00+08:00');
      panel.innerHTML = render(snapshot, isChinese, reference);
      previous.disabled = windowDates(reference).start <= earliest;
      next.disabled = ends.length === 0;
      latest.disabled = end === today;
    }
    previous.addEventListener('click', function () {
      ends.push(end);
      var start = windowDates(new Date(end + 'T00:00:00+08:00')).start;
      end = new Date(Date.parse(start + 'T00:00:00Z') - 86400000).toISOString().slice(0, 10);
      update();
    });
    next.addEventListener('click', function () { if (ends.length) { end = ends.pop(); update(); } });
    latest.addEventListener('click', function () { ends = []; end = today; update(); });
    update();
  }

  return { windowDates: windowDates, summarize: summarize, render: render, mount: mount };
});
