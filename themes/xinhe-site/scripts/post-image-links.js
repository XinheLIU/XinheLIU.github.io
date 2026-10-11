'use strict';

const path = require('path');

// Resolve Markdown image paths beside the source file to Hexo's post asset URL.
hexo.extend.filter.register('after_post_render', function postImageLinks(data) {
  if (!data.source || !data.source.startsWith('_posts/') || !data.content) return;
  const sourceDirectory = path.dirname(path.join(hexo.source_dir, data.source));
  data.content = data.content.replace(/(<img\b[^>]*\ssrc=["'])([^"']+)(["'])/gi, function(match, before, source, after) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(source)) return match;
    const assetId = path.relative(hexo.base_dir, path.resolve(sourceDirectory, source)).split(path.sep).join('/');
    const asset = hexo.model('PostAsset').findById(assetId);
    if (!asset) return match;
    return before + hexo.config.root + asset.path.replace(/^\/+/, '') + after;
  });
});
