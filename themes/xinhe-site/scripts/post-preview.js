'use strict';

function firstImageSource(content) {
  const imageTag = String(content || '').match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return imageTag ? imageTag[1] : '';
}

hexo.extend.helper.register('post_preview_asset', function postPreviewAsset(post) {
  if (post.featured_asset) return post.featured_asset;
  return firstImageSource(post.content);
});
