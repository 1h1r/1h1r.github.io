/**
 * REST API 路由 - 供AI自动化和外部应用调用
 */
module.exports = function(express, upload, requireAuth, config) {
  const router = express.Router();
  const posts = require('../lib/posts');
  const plugins = require('../lib/plugins');
  const deploy = require('../lib/deploy');
  const media = require('../lib/media');

  /**
   * @api {get} /api/status 获取系统状态
   */
  router.get('/status', (req, res) => {
    const stats = posts.getStats();
    res.json({
      success: true,
      blog: config.blog,
      stats: {
        totalPosts: stats.totalPosts,
        totalCategories: stats.totalCategories,
        totalTags: stats.totalTags,
        totalWords: stats.totalWords,
      },
      plugins: plugins.getEnabledPlugins().length,
      deployStatus: deploy.getDeployStatus(),
    });
  });

  /**
   * @api {get} /api/posts 获取文章列表
   */
  router.get('/posts', requireAuth, (req, res) => {
    const allPosts = posts.getAllPosts();
    res.json({ success: true, count: allPosts.length, posts: allPosts });
  });

  /**
   * @api {get} /api/posts/:filename 获取单篇文章
   */
  router.get('/posts/:filename', requireAuth, (req, res) => {
    const post = posts.getPost(req.params.filename);
    if (post) {
      res.json({ success: true, post });
    } else {
      res.status(404).json({ success: false, error: '文章不存在' });
    }
  });

  /**
   * @api {post} /api/posts 创建新文章
   * @apiBody {String} title 文章标题
   * @apiBody {String} content 文章内容(Markdown)
   * @apiBody {String} [categories] 分类(逗号分隔)
   * @apiBody {String} [tags] 标签(逗号分隔)
   * @apiBody {String} [cover] 封面图
   * @apiBody {String} [description] 摘要
   * @apiBody {String} [date] 日期
   */
  router.post('/posts', requireAuth, (req, res) => {
    try {
      const postData = {
        title: req.body.title,
        content: req.body.content,
        categories: req.body.categories ? (Array.isArray(req.body.categories) ? req.body.categories : req.body.categories.split(',')) : [],
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',')) : [],
        cover: req.body.cover || '/img/cover/default.svg',
        description: req.body.description,
        date: req.body.date,
      };
      const result = posts.createPost(postData);
      res.json({ success: true, post: result, message: '文章创建成功' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  /**
   * @api {put} /api/posts/:filename 更新文章
   */
  router.put('/posts/:filename', requireAuth, (req, res) => {
    try {
      const postData = {
        title: req.body.title,
        content: req.body.content,
        categories: req.body.categories ? (Array.isArray(req.body.categories) ? req.body.categories : req.body.categories.split(',')) : [],
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',')) : [],
        cover: req.body.cover,
        description: req.body.description,
        date: req.body.date,
      };
      const result = posts.updatePost(req.params.filename, postData);
      if (result) {
        res.json({ success: true, post: result, message: '文章更新成功' });
      } else {
        res.status(404).json({ success: false, error: '文章不存在' });
      }
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  /**
   * @api {delete} /api/posts/:filename 删除文章
   */
  router.delete('/posts/:filename', requireAuth, (req, res) => {
    const result = posts.deletePost(req.params.filename);
    res.json({ success: result });
  });

  /**
   * @api {post} /api/ai/publish AI自动发文并部署
   * @apiBody {String} title 标题
   * @apiBody {String} content 内容
   * @apiBody {String} [categories] 分类
   * @apiBody {String} [tags] 标签
   * @apiBody {Boolean} [autoDeploy=true] 是否自动部署
   */
  router.post('/ai/publish', requireAuth, async (req, res) => {
    try {
      const postData = {
        title: req.body.title,
        content: req.body.content,
        categories: req.body.categories ? (Array.isArray(req.body.categories) ? req.body.categories : req.body.categories.split(',')) : ['生活'],
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',')) : ['AI生成'],
        cover: req.body.cover || '/img/cover/default.svg',
        description: req.body.description || req.body.content.substring(0, 100),
        date: req.body.date || new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      // 创建文章
      const postResult = posts.createPost(postData);

      // 如果设置了自动部署
      if (req.body.autoDeploy !== false && config.deploy.token) {
        const deployResult = await deploy.buildAndDeploy(config.deploy.token);
        res.json({
          success: true,
          post: postResult,
          deploy: deployResult.deploy,
          message: '文章创建并部署成功！',
          url: config.blog.domain,
        });
      } else {
        res.json({
          success: true,
          post: postResult,
          message: '文章创建成功（未自动部署，请手动构建部署）',
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  /**
   * @api {post} /api/deploy/build 构建站点
   */
  router.post('/deploy/build', requireAuth, async (req, res) => {
    try {
      const result = await deploy.buildSite();
      res.json({ success: true, message: '构建成功', output: result.output });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  /**
   * @api {post} /api/deploy/github 部署到GitHub
   */
  router.post('/deploy/github', requireAuth, async (req, res) => {
    try {
      const token = req.body.token || config.deploy.token;
      const result = await deploy.deployToGitHub(token);
      res.json({ success: true, message: '部署成功', url: result.url });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  /**
   * @api {post} /api/deploy/all 构建并部署
   */
  router.post('/deploy/all', requireAuth, async (req, res) => {
    try {
      const token = req.body.token || config.deploy.token;
      const result = await deploy.buildAndDeploy(token);
      res.json({ success: true, message: '构建并部署成功', url: result.deploy.url });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  /**
   * @api {get} /api/plugins 获取插件列表
   */
  router.get('/plugins', requireAuth, (req, res) => {
    const allPlugins = plugins.getAllPlugins();
    res.json({ success: true, count: allPlugins.length, plugins: allPlugins });
  });

  /**
   * @api {post} /api/plugins/:id/enable 启用插件
   */
  router.post('/plugins/:id/enable', requireAuth, (req, res) => {
    plugins.enablePlugin(req.params.id);
    res.json({ success: true });
  });

  /**
   * @api {post} /api/plugins/:id/disable 禁用插件
   */
  router.post('/plugins/:id/disable', requireAuth, (req, res) => {
    plugins.disablePlugin(req.params.id);
    res.json({ success: true });
  });

  /**
   * @api {get} /api/categories 获取分类
   */
  router.get('/categories', requireAuth, (req, res) => {
    const categories = posts.getCategories();
    res.json({ success: true, categories });
  });

  /**
   * @api {get} /api/tags 获取标签
   */
  router.get('/tags', requireAuth, (req, res) => {
    const tags = posts.getTags();
    res.json({ success: true, tags });
  });

  /**
   * @api {get} /api/media 获取媒体列表
   */
  router.get('/media', requireAuth, (req, res) => {
    const allMedia = media.getAllMedia();
    res.json({ success: true, count: allMedia.length, media: allMedia });
  });

  /**
   * @api {post} /api/media/upload 上传媒体文件
   */
  router.post('/media/upload', requireAuth, upload.array('files', 20), (req, res) => {
    try {
      const results = req.files.map(f => media.saveMedia(f, req.body.subdir || 'uploads'));
      res.json({ success: true, files: results });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  return router;
};
