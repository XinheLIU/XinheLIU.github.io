'use strict';
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const history = require('../../../tools/lib/writing-history.cjs');
const activity = require('../source/js/writing-activity');

// The published series builder predates catalog.json. Read its pinned manifests
// directly as well, so writing history does not depend on the authoring refactor.
function manifestRecords() {
    const roots = [{ root: hexo.base_dir, owner: 'site-source', siteOwned: true }];
    const sources = path.join(hexo.base_dir, 'sources');
    if (fs.existsSync(sources)) {
        fs.readdirSync(sources, { withFileTypes: true }).filter(entry => entry.isDirectory()).forEach(entry => {
            roots.push({ root: path.join(sources, entry.name), owner: entry.name, siteOwned: false });
        });
    }
    const records = [];
    for (const repository of roots) {
        for (const name of repository.siteOwned ? ['posts'] : ['series', 'book']) {
            const manifestPath = path.join(repository.root, 'collections', name + '.yml');
            if (!fs.existsSync(manifestPath)) continue;
            const manifest = yaml.load(fs.readFileSync(manifestPath, 'utf8'), { schema: yaml.JSON_SCHEMA });
            for (const item of manifest.items || []) {
                for (const [locale, relative] of Object.entries(item.source || {})) {
                    const file = path.resolve(repository.root, relative);
                    if (!file.startsWith(path.resolve(repository.root) + path.sep)) throw new Error('Writing source escapes repository');
                    if (!fs.existsSync(file)) continue;
                    const match = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
                    if (!match) continue;
                    const data = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {};
                    if (data.hide === true || (data.status && data.status !== 'published')) continue;
                    const localized = value => typeof value === 'string' ? value : value?.[locale] || value?.en;
                    const route = localized(item.site_route);
                    const url = route || (name === 'series'
                        ? (locale.startsWith('zh') ? '/' : '/en/') + manifest.id + '/' + item.id + '/'
                        : localized(item.book_url) || String(hexo.config.url).replace(/\/$/, '') + '/' + repository.owner + '/' + (localized(item.route) || '').replace(/^\//, ''));
                    records.push({ id: repository.owner + ':' + item.id, locale: locale === 'zh' ? 'zh-CN' : locale,
                        title: data.title || item.id, url, ...history.writingDates(data) });
                }
            }
        }
    }
    return records;
}

hexo.extend.helper.register('writing_activity_snapshot', function (locale) {
    const catalogPath = path.join(hexo.base_dir, '.generated/catalog.json');
    const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];
    const records = catalog.some(item => item.created_at || item.updated_at) ? catalog.map(function (item) {
        return { id: item.owner + ':' + item.id, locale: item.locale, title: item.title,
            url: item.site_url || item.source_url, created_at: item.created_at || '', updated_at: item.updated_at || '' };
    }) : manifestRecords();
    hexo.locals.get('posts').forEach(function (post) {
        if (post.hide === true || post.published === false) return;
        const match = (post.raw || '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!match) return;
        // JSON_SCHEMA leaves YAML dates as written, independent of machine timezone.
        const metadata = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {};
        if (metadata.status && metadata.status !== 'published') return;
        const id = metadata.id || metadata.content_id || metadata.work_key || post.source.replace(/\/(en|zh-CN|zh-cn)\.md$/, '');
        records.push({ id: (metadata.owner || 'site-source') + ':' + id,
            locale: metadata.locale || metadata.site_locale || 'zh-CN', title: post.title,
            url: '/' + String(post.path).replace(/^\//, ''), ...history.writingDates(metadata) });
    });
    return { events: history.writingEvents(records, locale) };
});

hexo.extend.helper.register('writing_activity_html', function (snapshot, isChinese) {
    return activity.render(snapshot, isChinese);
});

hexo.extend.helper.register('writing_activity_json', function (snapshot) {
    return JSON.stringify(snapshot).replace(/</g, '\\u003c');
});
