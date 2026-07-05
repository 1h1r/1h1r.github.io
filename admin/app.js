/**
 * 亦然亦航博客后台管理系统 - 主应用
 */
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const expressLayouts = require('express-ejs-layouts');
const config = require('./config');

// 确保数据目录存在
if (!fs.existsSync(config.paths.dataDir)) {
  fs.mkdirSync(config.paths.dataDir, { recursive: true });
}

const app = express();
const PORT = config.server.port;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false,
}));

// 静态文件
app.use('/admin/static', express.static(path.join(__dirname, 'public')));

// 解析请求体
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// 会话
app.use(session({
  secret: config.server.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
}));

// 视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// 文件上传配置
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// 速率限制
const apiLimiter = rateLimit({
  windowMs: config.api.rateLimit.windowMs,
  max: config.api.rateLimit.max,
  message: { error: '请求过于频繁，请稍后再试' },
});

// 认证中间件
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

function requireApiAuth(req, res, next) {
  const auth = require('./lib/auth');
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  if (apiKey && auth.verifyApiKey(apiKey)) {
    next();
  } else if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: '未授权', message: '请提供有效的API密钥' });
  }
}

// ==================== 路由 ====================

// 登录页面
app.get('/admin/login', (req, res) => {
  res.render('login', { config, layout: false });
});

// 登录处理
app.post('/admin/login', (req, res) => {
  const auth = require('./lib/auth');
  const { username, password } = req.body;
  if (auth.verifyPassword(username, password)) {
    req.session.user = { username, loginTime: Date.now() };
    res.redirect('/admin');
  } else {
    res.render('login', { config, error: '用户名或密码错误', layout: false });
  }
});

// 退出登录
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ==================== 后台管理路由 ====================
const adminRoutes = require('./routes/admin');
app.use('/admin', requireAuth, adminRoutes(express, upload, config));

// ==================== REST API 路由 ====================
const apiRoutes = require('./routes/api');
app.use('/api', apiLimiter, apiRoutes(express, upload, requireApiAuth, config));

// 首页重定向到后台
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     亦然亦航博客后台管理系统已启动     ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  后台地址: http://localhost:' + PORT + '/admin' + '         ║');
  console.log('║  API地址:  http://localhost:' + PORT + '/api' + '          ║');
  console.log('║  用户名:   admin                              ║');
  console.log('║  密码:     yiran2023                          ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});
