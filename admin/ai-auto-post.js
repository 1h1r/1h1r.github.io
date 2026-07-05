#!/usr/bin/env node
/**
 * 亦然亦航博客 - AI自动化发文脚本
 * 
 * 使用方法:
 *   node ai-auto-post.js --title "标题" --content "内容" --categories "幼儿园" --tags "亦然,成长"
 *   node ai-auto-post.js --file post.json   (从JSON文件读取)
 *   node ai-auto-post.js --auto            (自动生成文章并发布)
 * 
 * API文档:
 *   POST /api/ai/publish  - AI自动发文并部署
 *   POST /api/posts       - 创建文章
 *   POST /api/deploy/all  - 构建并部署
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ===== 配置 =====
const CONFIG = {
  host: 'localhost',
  port: 3000,
  apiKey: 'yy-admin-api-key-2023-secure',
  autoDeploy: true,
};

// ===== HTTP请求工具 =====
function apiRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CONFIG.apiKey,
      },
    };
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ success: false, error: '解析响应失败: ' + data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ===== 文章模板生成器 =====
const TEMPLATES = {
  kindergarten: (date, topic) => ({
    title: `${date} 幼儿园日记：${topic}`,
    content: `## ${topic}

今天是${date}，亦然和亦航在幼儿园又度过了快乐的一天！

### 今日活动

${topic}是今天的主题活动。两个孩子都表现得非常棒：

- **亦然**：积极举手回答问题，思路清晰
- **亦航**：在动手环节展现了很强的协调能力

### 老师评价

老师今天特意表扬了双胞胎兄弟的团队合作精神，说他们在活动中互相帮助，是班上的好榜样。

### 成长记录

| 项目 | 亦然 | 亦航 |
|------|------|------|
| 参与度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 表达能力 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 动手能力 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

> 每一天都在成长，每一天都值得记录。`,
    categories: ['幼儿园'],
    tags: ['亦然', '亦航', '成长日记', topic],
  }),

  primary: (date, subject) => ({
    title: `${date} 小学课堂：${subject}`,
    content: `## ${subject}课记录

${date}，今天在学校上了${subject}课，收获满满！

### 课堂笔记

${subject}课上老师讲了很多有趣的知识。亦然和亦航都认真做了笔记：

1. 课堂重点内容
2. 课后思考题
3. 拓展阅读推荐

### 作业情况

两个孩子今天的作业都完成得很好：

- 亦然：数学练习全对，语文阅读理解也很出色
- 亦航：科学实验报告写得生动有趣

### 课外阅读

睡前读了一章《小王子》，两兄弟讨论了很久关于"驯服"的含义。`,
    categories: ['小学'],
    tags: ['亦然', '亦航', subject, '课堂笔记'],
  }),

  life: (date, activity) => ({
    title: `${date} 趣味生活：${activity}`,
    content: `## ${activity}

${date}，今天全家一起${activity}，度过了美好的亲子时光！

### 活动记录

今天的活动是${activity}，两个孩子都非常兴奋：

- 准备阶段：全家一起分工合作
- 活动过程：充满欢声笑语
- 活动总结：收获满满，意犹未尽

### 亦然的表现

亦然在这次活动中展现了很好的领导力，主动承担了很多任务。

### 亦航的表现

亦航则展现了出色的执行力，把亦然分配的任务都完成得很出色。

### 照片回忆

> 每一张照片都是时光的标本，记录着成长的点点滴滴。

### 总结

今天的${activity}不仅锻炼了孩子们的能力，更增进了全家人的感情。亦然亦航，愿你们永远这样快乐！`,
    categories: ['生活'],
    tags: ['亦然', '亦航', activity, '亲子活动', '生活实践'],
  }),
};

// ===== 自动生成文章 =====
function autoGeneratePost() {
  const stages = Object.keys(TEMPLATES);
  const stage = stages[Math.floor(Math.random() * stages.length)];
  const topics = {
    kindergarten: ['画画课', '唱歌表演', '户外游戏', '手工制作', '绘本阅读'],
    primary: ['语文', '数学', '英语', '科学', '美术'],
    life: ['公园野餐', '博物馆参观', '家庭烘焙', '户外徒步', '阅读时光'],
  };
  const topicList = topics[stage];
  const topic = topicList[Math.floor(Math.random() * topicList.length)];
  const now = new Date();
  const dateStr = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
  
  return TEMPLATES[stage](dateStr, topic);
}

// ===== 主函数 =====
async function main() {
  const args = process.argv.slice(2);
  
  let postData;
  
  if (args.includes('--auto')) {
    // 自动生成模式
    console.log('🤖 AI自动生成文章中...\n');
    postData = autoGeneratePost();
    console.log(`📝 标题: ${postData.title}`);
    console.log(`📂 分类: ${postData.categories.join(', ')}`);
    console.log(`🏷️  标签: ${postData.tags.join(', ')}`);
    console.log(`📄 内容长度: ${postData.content.length} 字\n`);
  } else if (args.includes('--file')) {
    // 从文件读取
    const fileIdx = args.indexOf('--file') + 1;
    const filePath = args[fileIdx];
    if (!filePath) { console.error('❌ 请指定JSON文件路径'); process.exit(1); }
    postData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    // 命令行参数
    const getArg = (name) => {
      const idx = args.indexOf(name);
      return idx > -1 ? args[idx + 1] : null;
    };
    postData = {
      title: getArg('--title') || '未命名文章',
      content: getArg('--content') || '（无内容）',
      categories: getArg('--categories') ? getArg('--categories').split(',') : ['生活'],
      tags: getArg('--tags') ? getArg('--tags').split(',') : ['AI生成'],
    };
  }
  
  // 确认
  if (!args.includes('--yes') && !args.includes('--auto')) {
    console.log('即将发布文章，确认继续？(y/n)');
    process.stdin.resume();
    process.stdin.on('data', async (data) => {
      if (data.toString().trim().toLowerCase() === 'y') {
        await publishPost(postData);
      } else {
        console.log('已取消');
        process.exit(0);
      }
    });
  } else {
    await publishPost(postData);
  }
}

async function publishPost(postData) {
  console.log('🚀 正在发布文章...\n');
  
  // 调用AI发文API
  const result = await apiRequest('POST', '/api/ai/publish', {
    ...postData,
    autoDeploy: CONFIG.autoDeploy,
  });
  
  if (result.success) {
    console.log('✅ 文章发布成功！');
    console.log(`📝 文件名: ${result.post.filename}`);
    console.log(`🔗 博客地址: ${result.url || 'https://1h1r.github.io'}`);
    if (result.deploy) {
      console.log('🚀 已自动部署到 GitHub Pages！');
    }
  } else {
    console.error('❌ 发布失败:', result.error);
    process.exit(1);
  }
}

// ===== 运行 =====
main().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
