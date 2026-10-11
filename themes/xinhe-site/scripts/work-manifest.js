function getWork(works, key) {
    return works.find(function(work) {
        return work.key === key;
    });
}

function localizeWork(work, locale) {
    var isChinese = (locale || '').indexOf('zh') === 0;
    var url = isChinese ? work.url_zh : work.url_en;
    if (!url) {
        return null;
    }
    return {
        key: work.key,
        type: work.type,
        title: isChinese ? (work.title_zh || work.title_en) : (work.title_en || work.title_zh),
        summary: isChinese ? (work.summary_zh || work.summary_en) : (work.summary_en || work.summary_zh),
        url: url,
        date: work.date,
        topic_cluster: work.topic_cluster,
        featured_asset: work.featured_asset,
        slide_count: work.slide_count,
        external: work.external,
        status_en: work.status_en,
        status_zh: work.status_zh
    };
}

function getRelatedWorks(works, work, locale) {
    if (!work || !work.related || !work.related.length) {
        return [];
    }
    return work.related
        .map(function(key) {
            var related = getWork(works, key);
            if (!related) {
                return null;
            }
            return localizeWork(related, locale);
        })
        .filter(function(related) {
            return related !== null;
        });
}

hexo.extend.helper.register('getWork', function(key, locale) {
    var works = hexo.locals.get('data').works || [];
    var work = getWork(works, key);
    if (!work) {
        return null;
    }
    return localizeWork(work, locale);
});

hexo.extend.helper.register('getRelatedWorks', function(key, locale) {
    var works = hexo.locals.get('data').works || [];
    var work = getWork(works, key);
    if (!work) {
        return [];
    }
    return getRelatedWorks(works, work, locale);
});

hexo.extend.helper.register('getAllWorks', function(locale) {
    var works = hexo.locals.get('data').works || [];
    var nativePosts = hexo.locals.get('posts').toArray();
    var previewByUrl = new Map();
    var previewAsset = this.post_preview_asset;
    nativePosts.concat(this.series_entries()).forEach(function(post) {
        var url = '/' + String(post.path || '').replace(/^\//, '').replace(/index\.html$/, '');
        previewByUrl.set(url, previewAsset(post));
    });
    var fs = require('fs');
    var path = require('path');
    var catalogPath = path.join(hexo.base_dir, '.generated', 'catalog.json');
    var catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];
    var manual = works
        .map(function(work) {
            return localizeWork(work, locale);
        })
        .filter(function(work) {
            return work !== null;
        });
    var posts = nativePosts.filter(function(post) {
        return (post.site_locale || 'en') === locale;
    }).map(function(post) {
        return {
            key: post.content_id || post.slug || post.path,
            type: 'article',
            title: post.title,
            summary: locale === 'zh-CN' ? (post.summary_zh || post.excerpt) : (post.summary_en || post.excerpt),
            url: '/' + String(post.path || '').replace(/^\//, '').replace(/index\.html$/, ''),
            date: post.date,
            topic_cluster: post.topic_cluster || 'writing',
            owner_name: locale === 'zh-CN' ? '个人网站' : 'Personal site',
            external: false
        };
    });
    var seenUrls = new Set(manual.map(function(work) { return work.url; }));
    var combined = manual.concat(posts.filter(function(item) {
        if (seenUrls.has(item.url)) return false;
        seenUrls.add(item.url);
        return true;
    }));
    return combined.concat(catalog.filter(function(item) {
        return item.locale === locale && (item.site_url || item.source_url);
    }).map(function(item) {
        return {
            key: item.id,
            type: item.content_type,
            title: item.title,
            summary: item.summary,
            url: item.site_url || item.source_url,
            date: item.published_at,
            topic_cluster: item.topic_cluster,
            owner_name: item.owner_name,
            external: /^https?:\/\//.test(item.site_url || item.source_url)
        };
    }).filter(function(item) {
        if (seenUrls.has(item.url)) return false;
        seenUrls.add(item.url);
        return true;
    })).map(function(work) {
        return Object.assign({}, work, {
            featured_asset: work.featured_asset || previewByUrl.get(work.url) || ''
        });
    });
});

hexo.extend.helper.register('getTopicClusters', function(locale) {
    var works = hexo.locals.get('data').works || [];
    var clusters = new Set();
    works.forEach(function(work) {
        var localized = localizeWork(work, locale);
        if (localized && work.topic_cluster) {
            clusters.add(work.topic_cluster);
        }
    });
    return Array.from(clusters).sort();
});
