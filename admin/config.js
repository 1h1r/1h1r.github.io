/**
 * 亦然亦航博客后台管理系统 - 配置文件
 */
const path = require('path');

const BLOG_ROOT = path.resolve(__dirname, '..');
const ADMIN_ROOT = path.resolve(__dirname);

module.exports = {
  // 博客配置
  blog: {
    name: '亦然亦航',
    subtitle: '双胞胎男孩的成长博客',
    description: '记录亦然亦航从幼儿园到大学的成长历程',
    birthday: '2023-07-31',
    domain: 'https://1r1h.com',
  },

  // 路径配置
  paths: {
    blogRoot: BLOG_ROOT,
    postsDir: path.join(BLOG_ROOT, 'source', '_posts'),
    sourceDir: path.join(BLOG_ROOT, 'source'),
    publicDir: path.join(BLOG_ROOT, 'public'),
    themesDir: path.join(BLOG_ROOT, 'themes'),
    mediaDir: path.join(BLOG_ROOT, 'source', 'img'),
    adminRoot: ADMIN_ROOT,
    dataDir: path.join(ADMIN_ROOT, 'data'),
    pluginsDir: path.join(ADMIN_ROOT, 'plugins'),
    uploadsDir: path.join(BLOG_ROOT, 'source', 'img', 'uploads'),
  },

  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    sessionSecret: 'yiran-yihang-blog-secret-key-2023',
  },

  // 管理员配置（初始）
  admin: {
    username: 'admin',
    // 密码: yiran2023  (bcrypt hash)
    passwordHash: '$2b$10$aIplxbuu8s2/SdQ4kpckTOUPrWbXYvUxQdi2aR9bzncoFs5W1KrBi',
    email: 'admin@yiran-yihang.com',
  },

  // API配置
  api: {
    // AI自动化API密钥
    apiKey: 'yy-admin-api-key-2023-secure',
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
  },

  // GitHub部署配置
  deploy: {
    repo: '1h1r/1h1r.github.io',
    branch: 'main',
    sourceBranch: 'source',
    token: process.env.GITHUB_TOKEN || '',
  },

  // 插件配置
  plugins: {
    enabled: [
      'seo-optimizer',
      'security-guard',
      'cache-master',
      'social-sharer',
      'comment-system',
      'analytics',
      'image-optimizer',
      'ai-writer',
      'backup-manager',
      'newsletter',
    ],
  },
};
