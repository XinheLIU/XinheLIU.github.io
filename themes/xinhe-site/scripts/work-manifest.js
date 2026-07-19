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
    return works
        .map(function(work) {
            return localizeWork(work, locale);
        })
        .filter(function(work) {
            return work !== null;
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
