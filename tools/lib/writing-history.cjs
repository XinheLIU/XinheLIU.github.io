'use strict';

/** @typedef {{created?: string | Date, date?: string | Date, updated?: string | Date, last_updated?: string | Date}} WritingDates */

/** @param {string | Date | undefined} value @returns {string} */
function sourceDate(value) {
  if (value === undefined || value === null || value === '') return '';
  const text = value instanceof Date ? value.toISOString() : String(value);
  const day = text.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day) {
    throw new Error(`Invalid writing date: ${text}`);
  }
  return day;
}

/** Read only explicit source metadata, never inferred Hexo updated/mtime. @param {WritingDates} metadata */
function writingDates(metadata) {
  const created_at = sourceDate(metadata.created ?? metadata.date);
  const updated_at = sourceDate(metadata.last_updated ?? metadata.updated);
  if (created_at && updated_at && updated_at < created_at) throw new Error(`Writing update ${updated_at} precedes creation ${created_at}`);
  return { created_at, updated_at };
}

/**
 * @typedef {{id: string, locale: string, title: string, url: string, created_at: string, updated_at: string}} WritingRecord
 * @typedef {{id: string, date: string, kind: 'created' | 'updated', title: string, url: string}} WritingEvent
 */

/** Keep all history; deduplicate translations and book/blog projections. @param {WritingRecord[]} records @param {string} locale @returns {WritingEvent[]} */
function writingEvents(records, locale) {
  /** @type {Map<string, WritingRecord[]>} */
  const byId = new Map();
  for (const record of records) {
    if (!byId.has(record.id)) byId.set(record.id, []);
    byId.get(record.id).push(record);
  }
  /** @type {WritingEvent[]} */
  const events = [];
  for (const [id, versions] of byId) {
    const display = versions.find(record => record.locale === locale) || versions.find(record => record.locale === 'en') || versions[0];
    const creation = versions.map(record => record.created_at).filter(Boolean).sort()[0];
    if (creation) events.push({ id, date: creation, kind: 'created', title: display.title, url: display.url });
    const updates = new Set(versions.map(record => record.updated_at).filter(date => date && (!creation || date > creation)));
    for (const date of updates) events.push({ id, date, kind: 'updated', title: display.title, url: display.url });
  }
  return events.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

module.exports = { sourceDate, writingDates, writingEvents };
