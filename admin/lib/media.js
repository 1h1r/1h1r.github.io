/**
 * 媒体管理模块 - 图片上传、浏览、管理
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');

const MEDIA_DIR = config.paths.mediaDir;

/**
 * 获取所有媒体文件
 */
function getAllMedia() {
  const media = [];
  function scanDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        scanDir(path.join(dir, entry.name), prefix + entry.name + '/');
      } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(entry.name)) {
        const fullPath = path.join(dir, entry.name);
        const stat = fs.statSync(fullPath);
        media.push({
          name: entry.name,
          path: '/img/' + prefix + entry.name,
          size: stat.size,
          sizeText: formatSize(stat.size),
          modified: stat.mtime,
          url: config.blog.domain + '/img/' + prefix + entry.name,
        });
      }
    }
  }
  scanDir(MEDIA_DIR);
  return media;
}

/**
 * 保存上传的文件
 */
function saveMedia(file, subdir = 'uploads') {
  const uploadDir = path.join(MEDIA_DIR, subdir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filename = Date.now() + '-' + file.originalname;
  const fullPath = path.join(uploadDir, filename);
  fs.writeFileSync(fullPath, file.buffer);
  return {
    name: filename,
    path: '/img/' + subdir + '/' + filename,
    url: config.blog.domain + '/img/' + subdir + '/' + filename,
  };
}

/**
 * 删除媒体文件
 */
function deleteMedia(mediaPath) {
  const fullPath = path.join(config.paths.sourceDir, mediaPath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

module.exports = {
  getAllMedia,
  saveMedia,
  deleteMedia,
};
