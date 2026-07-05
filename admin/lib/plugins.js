/**
 * 插件系统模块 - 管理插件的加载、启用、禁用
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');

const PLUGINS_DIR = config.paths.pluginsDir;

/**
 * 内置插件定义
 */
const BUILTIN_PLUGINS = [
  {
    id: 'seo-optimizer',
    name: 'SEO优化器',
    description: '自动生成meta标签、结构化数据、站点地图，提升搜索引擎排名',
    version: '2.1.0',
    author: '亦然亦航官方',
    icon: 'fa-search',
    settings: {
      autoMeta: true,
      sitemap: true,
      structuredData: true,
      openGraph: true,
    },
  },
  {
    id: 'security-guard',
    name: '安全防护',
    description: '速率限制、防CSRF攻击、XSS过滤、IP黑名单、防火墙规则',
    version: '3.0.1',
    author: '亦然亦航官方',
    icon: 'fa-shield-alt',
    settings: {
      rateLimit: true,
      csrfProtection: true,
      xssFilter: true,
      ipBlacklist: true,
      firewall: true,
    },
  },
  {
    id: 'cache-master',
    name: '缓存大师',
    description: '页面缓存、图片压缩、CDN加速、Gzip压缩，让网站飞起来',
    version: '2.5.0',
    author: '亦然亦航官方',
    icon: 'fa-bolt',
    settings: {
      pageCache: true,
      imageOptimize: true,
      gzip: true,
      cdn: false,
    },
  },
  {
    id: 'social-sharer',
    name: '社交分享',
    description: '微信、微博、QQ、豆瓣等社交平台一键分享按钮',
    version: '1.8.0',
    author: '亦然亦航官方',
    icon: 'fa-share-alt',
    settings: {
      wechat: true,
      weibo: true,
      qq: true,
      douban: true,
      copyLink: true,
    },
  },
  {
    id: 'comment-system',
    name: '评论系统',
    description: '内置评论系统，支持表情、回复、点赞、反垃圾',
    version: '2.0.0',
    author: '亦然亦航官方',
    icon: 'fa-comments',
    settings: {
      enableComments: true,
      allowReply: true,
      allowEmoji: true,
      antiSpam: true,
      moderation: false,
    },
  },
  {
    id: 'analytics',
    name: '访问统计',
    description: '访客统计、页面浏览量、热门文章、来源分析',
    version: '1.5.0',
    author: '亦然亦航官方',
    icon: 'fa-chart-bar',
    settings: {
      trackVisits: true,
      trackViews: true,
      popularPosts: true,
      referrerAnalysis: true,
    },
  },
  {
    id: 'image-optimizer',
    name: '图片优化',
    description: '自动压缩图片、生成WebP格式、懒加载、响应式图片',
    version: '1.3.0',
    author: '亦然亦航官方',
    icon: 'fa-image',
    settings: {
      autoCompress: true,
      webp: true,
      lazyLoad: true,
      responsive: true,
    },
  },
  {
    id: 'ai-writer',
    name: 'AI写作助手',
    description: 'AI自动生成文章、智能推荐标题、自动摘要、内容优化',
    version: '2.2.0',
    author: '亦然亦航官方',
    icon: 'fa-robot',
    settings: {
      autoGenerate: true,
      titleSuggest: true,
      autoSummary: true,
      contentOptimize: true,
      apiKey: '',
    },
  },
  {
    id: 'backup-manager',
    name: '备份管理',
    description: '自动备份到GitHub、定时快照、一键恢复',
    version: '1.1.0',
    author: '亦然亦航官方',
    icon: 'fa-database',
    settings: {
      autoBackup: true,
      backupFrequency: 'daily',
      githubBackup: true,
      maxBackups: 30,
    },
  },
  {
    id: 'newsletter',
    name: '邮件订阅',
    description: '读者邮件订阅、新文章通知、定时推送',
    version: '1.0.0',
    author: '亦然亦航官方',
    icon: 'fa-envelope',
    settings: {
      enableSubscription: true,
      newPostNotify: true,
      weeklyDigest: false,
    },
  },
  {
    id: 'reading-progress',
    name: '阅读进度条',
    description: '文章阅读进度显示、阅读时间估算、目录导航',
    version: '1.2.0',
    author: '亦然亦航官方',
    icon: 'fa-book-reader',
    settings: {
      progressBar: true,
      readingTime: true,
      toc: true,
    },
  },
  {
    id: 'gallery-plus',
    name: '相册增强',
    description: '瀑布流相册、图片灯箱、相册分类、批量上传',
    version: '2.0.0',
    author: '亦然亦航官方',
    icon: 'fa-images',
    settings: {
      masonry: true,
      lightbox: true,
      categories: true,
      batchUpload: true,
    },
  },
];

/**
 * 获取所有插件
 */
function getAllPlugins() {
  return BUILTIN_PLUGINS.map(p => ({
    ...p,
    enabled: config.plugins.enabled.includes(p.id),
  }));
}

/**
 * 获取已启用的插件
 */
function getEnabledPlugins() {
  return getAllPlugins().filter(p => p.enabled);
}

/**
 * 启用插件
 */
function enablePlugin(pluginId) {
  if (!config.plugins.enabled.includes(pluginId)) {
    config.plugins.enabled.push(pluginId);
    savePluginConfig();
  }
  return true;
}

/**
 * 禁用插件
 */
function disablePlugin(pluginId) {
  const idx = config.plugins.enabled.indexOf(pluginId);
  if (idx > -1) {
    config.plugins.enabled.splice(idx, 1);
    savePluginConfig();
  }
  return true;
}

/**
 * 更新插件设置
 */
function updatePluginSettings(pluginId, settings) {
  const plugin = BUILTIN_PLUGINS.find(p => p.id === pluginId);
  if (plugin) {
    plugin.settings = { ...plugin.settings, ...settings };
    savePluginConfig();
    return true;
  }
  return false;
}

/**
 * 保存插件配置到文件
 */
function savePluginConfig() {
  const dataPath = path.join(config.paths.dataDir, 'plugins.json');
  const data = {
    enabled: config.plugins.enabled,
    settings: BUILTIN_PLUGINS.reduce((acc, p) => {
      acc[p.id] = p.settings;
      return acc;
    }, {}),
  };
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  getAllPlugins,
  getEnabledPlugins,
  enablePlugin,
  disablePlugin,
  updatePluginSettings,
};
