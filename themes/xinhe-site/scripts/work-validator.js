hexo.extend.filter.register('before_generate', function() {
    var works = hexo.locals.get('data').works || [];
    var posts = hexo.locals.get('posts');
    var errors = [];
    var warnings = [];
    var keys = new Set();
    
    works.forEach(function(work) {
        if (!work.key) {
            errors.push('Missing key for work: ' + JSON.stringify(work));
        } else if (keys.has(work.key)) {
            errors.push('Duplicate work key: ' + work.key);
        } else {
            keys.add(work.key);
        }
    });
    
    works.forEach(function(work) {
        if (work.related) {
            work.related.forEach(function(relatedKey) {
                if (!keys.has(relatedKey)) {
                    errors.push('Related work key not found: ' + relatedKey + ' referenced from work ' + work.key);
                }
            });
        }
    });
    
    works.forEach(function(work) {
        if (work.related) {
            work.related.forEach(function(relatedKey) {
                var related = works.find(function(w) { return w.key === relatedKey; });
                if (related && (!related.related || !related.related.includes(work.key))) {
                    warnings.push('Missing reverse link: ' + work.key + ' references ' + relatedKey + ' but not vice versa');
                }
            });
        }
    });
    
    posts.forEach(function(post) {
        if (post.work_key) {
            if (!keys.has(post.work_key)) {
                errors.push('Post references work key not found: ' + post.work_key + ' for post ' + post.path);
            }
        }
    });
    
    if (errors.length > 0) {
        errors.forEach(function(error) {
            hexo.log.error(error);
        });
        throw new Error('Work manifest validation failed with ' + errors.length + ' errors');
    }
    if (warnings.length > 0) {
        warnings.forEach(function(warning) {
            hexo.log.warn(warning);
        });
    }
});
