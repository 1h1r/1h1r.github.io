/**
 * 后台管理路由
 */
module.exports = function(express, upload, config) {
  const router = express.Router();
  const posts = require('../lib/posts');
  const plugins = require('../lib/plugins');
  const media = require('../lib/media');
  const deploy = require('../lib/deploy');

  // 仪表盘
  router.get('/', (req, res) => {
    const stats = posts.getStats();
    const deployStatus = deploy.getDeployStatus();
    const enabledPlugins = plugins.getEnabledPlugins();
    res.render('dashboard', { config, stats, deployStatus, enabledPlugins, user: req.session.user });
  });

  // 文章列表
  router.get('/posts', (req, res) => {
    const allPosts = posts.getAllPosts();
    const categories = posts.getCategories();
    const tags = posts.getTags();
    res.render('posts', { config, posts: allPosts, categories, tags, user: req.session.user });
  });

  // 新建文章页面
  router.get('/posts/new', (req, res) => {
    const categories = posts.getCategories();
    const tags = posts.getTags();
    res.render('editor', { config, post: null, categories, tags, user: req.session.user });
  });

  // 编辑文章页面
  router.get('/posts/edit/:filename', (req, res) => {
    const post = posts.getPost(req.params.filename);
    const categories = posts.getCategories();
    const tags = posts.getTags();
    res.render('editor', { config, post, categories, tags, user: req.session.user });
  });

  // 保存文章
  router.post('/posts/save', (req, res) => {
    try {
      const postData = {
        title: req.body.title,
        content: req.body.content,
        categories: req.body.categories ? req.body.categories.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags: req.body.tags ? req.body.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        cover: req.body.cover || '/img/cover/default.svg',
        description: req.body.description,
        date: req.body.date,
        top: req.body.top ? parseInt(req.body.top) : 0,
        draft: req.body.draft === 'on',
      };
      let result;
      if (req.body.filename) {
        result = posts.updatePost(req.body.filename, postData);
      } else {
        result = posts.createPost(postData);
      }
      res.json({ success: true, post: result });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  // 删除文章
  router.post('/posts/delete', (req, res) => {
    const result = posts.deletePost(req.body.filename);
    res.json({ success: result });
  });

  // 媒体管理
  router.get('/media', (req, res) => {
    const allMedia = media.getAllMedia();
    res.render('media', { config, media: allMedia, user: req.session.user });
  });

  // 上传媒体
  router.post('/media/upload', upload.array('files', 20), (req, res) => {
    try {
      const results = req.files.map(f => media.saveMedia(f, req.body.subdir || 'uploads'));
      res.json({ success: true, files: results });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  // 删除媒体文件
  router.post('/media/delete', (req, res) => {
    const result = media.deleteMedia(req.body.path);
    res.json({ success: result });
  });

  // 分类管理
  router.get('/categories', (req, res) => {
    const categories = posts.getCategories();
    const tags = posts.getTags();
    res.render('categories', { config, categories, tags, user: req.session.user });
  });

  // 插件管理
  router.get('/plugins', (req, res) => {
    const allPlugins = plugins.getAllPlugins();
    res.render('plugins', { config, plugins: allPlugins, user: req.session.user });
  });

  // 启用插件
  router.post('/plugins/enable', (req, res) => {
    plugins.enablePlugin(req.body.pluginId);
    res.json({ success: true });
  });

  // 禁用插件
  router.post('/plugins/disable', (req, res) => {
    plugins.disablePlugin(req.body.pluginId);
    res.json({ success: true });
  });

  // 更新插件设置
  router.post('/plugins/settings', (req, res) => {
    plugins.updatePluginSettings(req.body.pluginId, req.body.settings);
    res.json({ success: true });
  });

  // 设置页面
  router.get('/settings', (req, res) => {
    res.render('settings', { config, deployStatus: deploy.getDeployStatus(), user: req.session.user });
  });

  // 保存设置
  router.post('/settings/save', (req, res) => {
    if (req.body.blogName) config.blog.name = req.body.blogName;
    if (req.body.blogSubtitle) config.blog.subtitle = req.body.blogSubtitle;
    if (req.body.blogDescription) config.blog.description = req.body.blogDescription;
    if (req.body.githubToken) config.deploy.token = req.body.githubToken;
    if (req.body.newPassword) {
      const auth = require('../lib/auth');
      auth.changePassword(req.body.newPassword);
    }
    res.json({ success: true, message: '设置已保存' });
  });

  // 构建站点
  router.post('/deploy/build', async (req, res) => {
    try {
      const result = await deploy.buildSite();
      res.json({ success: true, message: '站点构建成功！', output: result.output });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  // 部署到GitHub
  router.post('/deploy/github', async (req, res) => {
    try {
      const token = req.body.token || config.deploy.token;
      const result = await deploy.deployToGitHub(token);
      res.json({ success: true, message: '部署成功！', url: result.url });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  // 构建并部署
  router.post('/deploy/all', async (req, res) => {
    try {
      const token = req.body.token || config.deploy.token;
      const result = await deploy.buildAndDeploy(token);
      res.json({ success: true, message: '构建并部署成功！', url: result.deploy.url });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  return router;
};
