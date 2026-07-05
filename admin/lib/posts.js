/**
 * 文章管理模块 - 读取/写入/管理 Markdown 文章
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');
const config = require('../config');

const POSTS_DIR = config.paths.postsDir;

/**
 * 获取所有文章列表
 */
function getAllPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(file => {
    const fullPath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontMatter, content } = matter(raw);
    return {
      filename: file,
      title: frontMatter.title || file.replace('.md', ''),
      date: frontMatter.date || '',
      categories: frontMatter.categories || [],
      tags: frontMatter.tags || [],
      cover: frontMatter.cover || '',
      description: frontMatter.description || '',
      top: frontMatter.top || 0,
      draft: frontMatter.draft || false,
      content: content,
      excerpt: content.substring(0, 200) + '...',
      wordCount: content.length,
    };
  });
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

/**
 * 获取单篇文章
 */
function getPost(filename) {
  const fullPath = path.join(POSTS_DIR, filename);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const { data: frontMatter, content } = matter(raw);
  return {
    filename,
    ...frontMatter,
    content,
    html: marked(content),
  };
}

/**
 * 创建新文章
 */
function createPost(postData) {
  const { title, content, categories, tags, cover, description, date, top, draft } = postData;
  const postDate = date || new Date().toISOString().replace('T', ' ').substring(0, 19);
  const dateStr = postDate.split(' ')[0];
  const slug = title.replace(/[^\w\u4e00-\u9fa5]/g, '-').toLowerCase();
  const filename = `${dateStr}-${slug}.md`;

  const frontMatter = {
    title,
    date: postDate,
    categories: categories || [],
    tags: tags || [],
    cover: cover || '/img/cover/default.svg',
    description: description || content.substring(0, 100),
  };
  if (top) frontMatter.top = top;
  if (draft) frontMatter.draft = true;

  const fileContent = matter.stringify(content || '', frontMatter);
  const fullPath = path.join(POSTS_DIR, filename);
  fs.writeFileSync(fullPath, fileContent, 'utf-8');
  return { filename, ...frontMatter };
}

/**
 * 更新文章
 */
function updatePost(filename, postData) {
  const fullPath = path.join(POSTS_DIR, filename);
  if (!fs.existsSync(fullPath)) return null;

  const { title, content, categories, tags, cover, description, date, top, draft } = postData;
  const frontMatter = {
    title: title || '',
    date: date || '',
    categories: categories || [],
    tags: tags || [],
    cover: cover || '/img/cover/default.svg',
    description: description || '',
  };
  if (top) frontMatter.top = top;
  if (draft !== undefined) frontMatter.draft = draft;

  const fileContent = matter.stringify(content || '', frontMatter);
  fs.writeFileSync(fullPath, fileContent, 'utf-8');

  // 如果标题变了，需要重命名文件
  if (postData.newFilename && postData.newFilename !== filename) {
    const newPath = path.join(POSTS_DIR, postData.newFilename);
    fs.renameSync(fullPath, newPath);
    return { filename: postData.newFilename, ...frontMatter };
  }

  return { filename, ...frontMatter };
}

/**
 * 删除文章
 */
function deletePost(filename) {
  const fullPath = path.join(POSTS_DIR, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
}

/**
 * 获取所有分类
 */
function getCategories() {
  const posts = getAllPosts();
  const catMap = {};
  posts.forEach(post => {
    const cats = Array.isArray(post.categories) ? post.categories : [post.categories];
    cats.forEach(cat => {
      if (cat) catMap[cat] = (catMap[cat] || 0) + 1;
    });
  });
  return Object.entries(catMap).map(([name, count]) => ({ name, count }));
}

/**
 * 获取所有标签
 */
function getTags() {
  const posts = getAllPosts();
  const tagMap = {};
  posts.forEach(post => {
    const tags = Array.isArray(post.tags) ? post.tags : [post.tags];
    tags.forEach(tag => {
      if (tag) tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });
  return Object.entries(tagMap).map(([name, count]) => ({ name, count }));
}

/**
 * 获取统计数据
 */
function getStats() {
  const posts = getAllPosts();
  const categories = getCategories();
  const tags = getTags();
  const totalWords = posts.reduce((sum, p) => sum + p.wordCount, 0);

  // 按阶段统计
  const stages = {
    '幼儿园': 0,
    '小学': 0,
    '初中': 0,
    '高中': 0,
    '大学': 0,
    '生活': 0,
  };
  posts.forEach(p => {
    const cats = Array.isArray(p.categories) ? p.categories : [p.categories];
    cats.forEach(c => {
      if (stages[c] !== undefined) stages[c]++;
    });
  });

  return {
    totalPosts: posts.length,
    totalCategories: categories.length,
    totalTags: tags.length,
    totalWords,
    stages,
    recentPosts: posts.slice(0, 5),
  };
}

module.exports = {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  getTags,
  getStats,
};
