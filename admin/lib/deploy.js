/**
 * 部署模块 - 构建Hexo静态站点并部署到GitHub Pages
 */
const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const BLOG_ROOT = config.paths.blogRoot;
const NODE_EXE = 'C:/Users/J/.workbuddy/binaries/node/versions/22.12.0/node.exe';
const HEXO_CLI = 'C:/Users/J/.workbuddy/binaries/node/workspace/node_modules/hexo-cli/bin/hexo';
const NODE_PATH = 'C:/Users/J/.workbuddy/binaries/node/workspace/node_modules:' + path.join(BLOG_ROOT, 'node_modules');

/**
 * 构建Hexo静态站点
 */
function buildSite() {
  return new Promise((resolve, reject) => {
    const cleanCmd = `"${NODE_EXE}" "${HEXO_CLI}" clean`;
    const genCmd = `"${NODE_EXE}" "${HEXO_CLI}" generate`;

    exec(cleanCmd, { cwd: BLOG_ROOT, env: { ...process.env, NODE_PATH } }, (err) => {
      if (err) { reject(new Error('清理失败: ' + err.message)); return; }
      exec(genCmd, { cwd: BLOG_ROOT, env: { ...process.env, NODE_PATH } }, (err2, stdout) => {
        if (err2) { reject(new Error('构建失败: ' + err2.message)); return; }
        resolve({ success: true, output: stdout });
      });
    });
  });
}

/**
 * 部署到GitHub Pages (main分支)
 */
function deployToGitHub(token) {
  return new Promise((resolve, reject) => {
    const deployToken = token || config.deploy.token;
    if (!deployToken) {
      reject(new Error('未配置GitHub Token，请在设置页面配置'));
      return;
    }

    const deployDir = path.join(path.dirname(BLOG_ROOT), 'deploy-pages');
    const repoUrl = `https://1h1r:${deployToken}@github.com/${config.deploy.repo}.git`;

    try {
      // 清理旧的部署目录
      if (fs.existsSync(deployDir)) {
        fs.rmSync(deployDir, { recursive: true, force: true });
      }
      fs.mkdirSync(deployDir, { recursive: true });

      // 复制构建产物
      const publicDir = path.join(BLOG_ROOT, 'public');
      if (!fs.existsSync(publicDir)) {
        reject(new Error('请先构建站点'));
        return;
      }
      copyDir(publicDir, deployDir);

      // 创建 .nojekyll 文件
      fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');

      // Git初始化并推送
      const cmds = [
        `git init`,
        `git config user.name "1h1r"`,
        `git config user.email "1h1r@users.noreply.github.com"`,
        `git checkout -b main`,
        `git add -A`,
        `git commit -m "deploy: auto-deploy from admin panel - ${new Date().toISOString()}"`,
        `git remote add origin "${repoUrl}"`,
        `git push -u origin main --force`,
      ];

      const fullCmd = cmds.join(' && ');
      exec(fullCmd, { cwd: deployDir }, (err, stdout, stderr) => {
        // 清理部署目录
        try { fs.rmSync(deployDir, { recursive: true, force: true }); } catch(e) {}
        if (err) {
          reject(new Error('部署失败: ' + stderr));
        } else {
          resolve({ success: true, output: stdout, url: config.blog.domain });
        }
      });
    } catch (e) {
      reject(new Error('部署出错: ' + e.message));
    }
  });
}

/**
 * 构建并部署
 */
async function buildAndDeploy(token) {
  const buildResult = await buildSite();
  const deployResult = await deployToGitHub(token);
  return { build: buildResult, deploy: deployResult };
}

/**
 * 获取部署状态
 */
function getDeployStatus() {
  return {
    blogRoot: BLOG_ROOT,
    domain: config.blog.domain,
    repo: config.deploy.repo,
    branch: config.deploy.branch,
    hasToken: !!config.deploy.token,
    lastBuild: fs.existsSync(path.join(BLOG_ROOT, 'public', 'index.html')),
  };
}

// 工具函数：递归复制目录
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = {
  buildSite,
  deployToGitHub,
  buildAndDeploy,
  getDeployStatus,
};
