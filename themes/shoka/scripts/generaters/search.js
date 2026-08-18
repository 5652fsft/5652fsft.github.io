'use strict';

hexo.extend.generator.register('search', function(locals) {
  const config = hexo.config;
  const theme = hexo.theme.config;

  var posts = locals.posts.sort('-date').map(function(post) {
    return {
      title: post.title || 'untitled',
      path: post.path,
      content: post.content ? post.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 10000) : '',
      date: post.date,
      categories: post.categories ? post.categories.map(function(cat) { return cat.name; }) : [],
      tags: post.tags ? post.tags.map(function(tag) { return tag.name; }) : []
    };
  });

  var pages = locals.pages.sort('-date').map(function(page) {
    return {
      title: page.title || 'untitled',
      path: page.path,
      content: page.content ? page.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 10000) : '',
      date: page.date,
      categories: page.categories ? page.categories.map(function(cat) { return cat.name; }) : [],
      tags: page.tags ? page.tags.map(function(tag) { return tag.name; }) : []
    };
  });

  var data = posts.concat(pages);

  return {
    path: 'search.json',
    data: JSON.stringify(data)
  };
});
