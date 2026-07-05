/**
 * 认证模块 - 用户登录、会话管理、API密钥验证
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const SESSION_SECRET = config.server.sessionSecret;

/**
 * 验证用户登录
 */
function verifyPassword(username, password) {
  if (username !== config.admin.username) return false;
  return bcrypt.compareSync(password, config.admin.passwordHash);
}

/**
 * 生成JWT令牌
 */
function generateToken(payload) {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: '7d' });
}

/**
 * 验证JWT令牌
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SESSION_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * 验证API密钥
 */
function verifyApiKey(apiKey) {
  return apiKey === config.api.apiKey;
}

/**
 * 修改管理员密码
 */
function changePassword(newPassword) {
  const hash = bcrypt.hashSync(newPassword, 10);
  config.admin.passwordHash = hash;
  // 在实际应用中，这里应该持久化到数据库
  const dataPath = require('path').join(config.paths.dataDir, 'auth.json');
  const fs = require('fs');
  fs.writeFileSync(dataPath, JSON.stringify({ passwordHash: hash }, null, 2));
  return true;
}

module.exports = {
  verifyPassword,
  generateToken,
  verifyToken,
  verifyApiKey,
  changePassword,
};
