/* ===============================
 * 亦然亦航 - 马里奥兄弟主题交互脚本
 * 超级马里奥风格的可爱儿童博客
 * =============================== */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {

  // ===============================
  // 0. 修复头像和图片加载错误
  // ===============================
  function fixBrokenImages() {
    // 修复 avatar 图片
    document.querySelectorAll('img[alt="avatar"], img[src*="loading.gif"], img[src*="friend_404.gif"]').forEach(function(img) {
      // 修复 loading.gif → loading.svg
      if (img.src && img.src.indexOf('loading.gif') !== -1) {
        img.src = '/img/loading.svg';
      }
      // 修复 data-lazy-src
      if (img.getAttribute('data-lazy-src') === '/' || img.getAttribute('data-lazy-src') === '') {
        img.setAttribute('data-lazy-src', '/img/avatar.svg');
        img.src = '/img/avatar.svg';
      }
      // 修复 friend_404.gif → friend_404.svg
      if (img.src && img.src.indexOf('friend_404.gif') !== -1) {
        img.src = '/img/friend_404.svg';
      }
      // 修复 onerror 中的 friend_404.gif
      var onerr = img.getAttribute('onerror');
      if (onerr && onerr.indexOf('friend_404.gif') !== -1) {
        img.setAttribute('onerror', "this.onerror=null;this.src='/img/friend_404.svg'");
      }
    });

    // 修复 favicon
    var favicon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
    if (favicon && favicon.href && favicon.href.indexOf('favicon.png') !== -1) {
      favicon.href = '/img/favicon.svg';
    }

    // 修复 banner 图片
    document.querySelectorAll('img[src*="banner/index.jpg"], img[src*="banner/category.jpg"], img[src*="banner/tag.jpg"], img[src*="banner/archive.jpg"], img[data-lazy-src*="banner/index.jpg"], img[data-lazy-src*="banner/category.jpg"], img[data-lazy-src*="banner/tag.jpg"], img[data-lazy-src*="banner/archive.jpg"]').forEach(function(img) {
      var src = img.getAttribute('data-lazy-src') || img.getAttribute('src') || '';
      src = src.replace('.jpg', '.svg');
      if (img.getAttribute('data-lazy-src')) {
        img.setAttribute('data-lazy-src', src);
      }
      if (img.getAttribute('src') && img.src.indexOf('loading') === -1) {
        img.src = src;
      }
    });

    // 修复 cover 图片
    document.querySelectorAll('img[src*="cover/default.jpg"], img[src*="cover/archive.jpg"], img[src*="cover/kindergarten.jpg"], img[src*="cover/primary.jpg"], img[src*="cover/junior.jpg"], img[src*="cover/high.jpg"], img[src*="cover/college.jpg"], img[data-lazy-src*="cover/"]').forEach(function(img) {
      var src = img.getAttribute('data-lazy-src') || img.getAttribute('src') || '';
      src = src.replace('.jpg', '.svg');
      if (img.getAttribute('data-lazy-src')) {
        img.setAttribute('data-lazy-src', src);
      }
      if (img.getAttribute('src') && img.src.indexOf('loading') === -1) {
        img.src = src;
      }
    });

    // 修复 index_bg.jpg → index_bg.svg
    document.querySelectorAll('[style*="index_bg.jpg"], [data-lazy-src*="index_bg.jpg"]').forEach(function(el) {
      var style = el.getAttribute('style') || '';
      if (style.indexOf('index_bg.jpg') !== -1) {
        el.setAttribute('style', style.replace('index_bg.jpg', 'index_bg.svg'));
      }
      var dl = el.getAttribute('data-lazy-src') || '';
      if (dl.indexOf('index_bg.jpg') !== -1) {
        el.setAttribute('data-lazy-src', dl.replace('index_bg.jpg', 'index_bg.svg'));
      }
    });

    // 修复 post-default.jpg → post-default.svg
    document.querySelectorAll('img[src*="post-default.jpg"], img[data-lazy-src*="post-default.jpg"]').forEach(function(img) {
      var src = (img.getAttribute('data-lazy-src') || img.getAttribute('src') || '').replace('.jpg', '.svg');
      if (img.getAttribute('data-lazy-src')) img.setAttribute('data-lazy-src', src);
      if (img.getAttribute('src') && img.src.indexOf('loading') === -1) img.src = src;
    });
  }

  // 立即执行一次
  fixBrokenImages();
  // DOM 完全加载后再执行一次
  setTimeout(fixBrokenImages, 100);
  setTimeout(fixBrokenImages, 500);
  setTimeout(fixBrokenImages, 1000);

  // 监听 DOM 变化，动态修复新加载的图片
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.addedNodes.length > 0) {
        fixBrokenImages();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ===============================
  // 1. 马里奥金币收集动画
  // ===============================
  function createCoinEffect(x, y) {
    const coin = document.createElement('div');
    coin.innerHTML = '🪙';
    coin.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: 24px;
      pointer-events: none;
      z-index: 99999;
      animation: coinFly 0.8s ease-out forwards;
    `;
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 800);
  }

  // 添加金币飞行动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes coinFly {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      50% { transform: translateY(-60px) scale(1.5); opacity: 0.8; }
      100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
    }
    
    @keyframes pipeWobble {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-2deg); }
      75% { transform: rotate(2deg); }
    }
    
    @keyframes brickBump {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    
    /* 马里奥管道弹出装饰 */
    .mario-pipe-deco {
      position: fixed;
      bottom: 0;
      right: 20px;
      width: 50px;
      height: 35px;
      background: #43B047;
      border: 3px solid #006400;
      border-radius: 8px 8px 0 0;
      z-index: 0;
      opacity: 0.4;
      pointer-events: none;
      transition: all 0.3s ease;
    }
    
    .mario-pipe-deco:hover {
      opacity: 0.8;
      animation: pipeWobble 0.5s ease;
    }
    
    /* 漂浮的问号砖块装饰 */
    .mario-question-block {
      position: fixed;
      top: 50%;
      right: 15px;
      width: 32px;
      height: 32px;
      background: #FAC000;
      border: 3px solid #C84C0C;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
      text-shadow: 1px 1px 0 #C84C0C;
      z-index: 0;
      opacity: 0.3;
      cursor: pointer;
      transition: all 0.3s ease;
      animation: brickBump 2s ease-in-out infinite;
    }
    
    .mario-question-block:hover {
      opacity: 1;
      transform: scale(1.2);
    }
    
    .mario-question-block.bumped {
      animation: brickBump 0.3s ease 3;
    }
    
    /* 马里奥云朵漂浮 */
    .mario-cloud {
      position: fixed;
      top: 10%;
      width: 80px;
      height: 40px;
      pointer-events: none;
      z-index: 0;
      opacity: 0.5;
      animation: cloudFloat 30s linear infinite;
    }
    
    @keyframes cloudFloat {
      from { transform: translateX(-100px); }
      to { transform: translateX(calc(100vw + 100px)); }
    }
    
    /* 像素星星装饰 */
    .mario-star {
      position: fixed;
      pointer-events: none;
      z-index: 9998;
      font-size: 20px;
      animation: starSpin 1s ease-out forwards;
    }
    
    @keyframes starSpin {
      0% { transform: rotate(0deg) scale(0); opacity: 1; }
      50% { transform: rotate(180deg) scale(1.5); opacity: 0.8; }
      100% { transform: rotate(360deg) scale(0); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // 添加管道装饰
  const pipeDeco = document.createElement('div');
  pipeDeco.className = 'mario-pipe-deco';
  document.body.appendChild(pipeDeco);

  // 添加问号砖块装饰
  const questionBlock = document.createElement('div');
  questionBlock.className = 'mario-question-block';
  questionBlock.textContent = '?';
  questionBlock.addEventListener('click', function() {
    this.classList.add('bumped');
    // 弹出金币
    const rect = this.getBoundingClientRect();
    createCoinEffect(rect.left, rect.top);
    // 随机提示语
    const messages = [
      '叮咚！获得了一个金币！🪙',
      '亦然说：好奇心是成长的超能力！',
      '亦航说：运动让我更快乐！⚽',
      'Wahoo! 双胞胎最棒！',
      'Mama Mia! 感谢你的访问！',
      '1-Up! 快乐成长每一天！'
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    if (typeof Snackbar !== 'undefined') {
      Snackbar.show({ text: msg, pos: 'bottom-right', duration: 3000, bg: '#FBD000', textColor: '#C84C0C' });
    }
    setTimeout(() => this.classList.remove('bumped'), 1000);
  });
  document.body.appendChild(questionBlock);

  // 添加漂浮云朵
  for (let i = 0; i < 2; i++) {
    const cloud = document.createElement('div');
    cloud.className = 'mario-cloud';
    cloud.style.top = `${5 + i * 8}%`;
    cloud.style.animationDelay = `${i * 15}s`;
    cloud.innerHTML = `<svg width="80" height="40" viewBox="0 0 80 40"><ellipse cx="20" cy="25" rx="15" ry="12" fill="white"/><ellipse cx="45" cy="20" rx="20" ry="15" fill="white"/><ellipse cx="60" cy="25" rx="12" ry="10" fill="white"/></svg>`;
    document.body.appendChild(cloud);
  }

  // ===============================
  // 2. 淡入动画 - 管道弹出效果
  // ===============================
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        entry.target.style.animation = 'pipeRise 0.6s ease';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.recent-post-item, .category-list-item, .tag-cloud-list a').forEach(el => {
    scrollObserver.observe(el);
  });

  // ===============================
  // 3. 双胞胎专属标识
  // ===============================
  function addTwinBadges() {
    const articles = document.querySelectorAll('#article-container');
    articles.forEach(article => {
      const html = article.innerHTML;
      article.innerHTML = html
        .replace(/\[亦然\]/g, '<span class="tag-yr">🍄 亦然</span>')
        .replace(/\[亦航\]/g, '<span class="tag-yh">⭐ 亦航</span>')
        .replace(/\[里程碑\]/g, '<span class="milestone">🏆 里程碑</span>');
    });
  }

  addTwinBadges();

  // ===============================
  // 4. 马里奥风格欢迎语
  // ===============================
  const hour = new Date().getHours();
  let greeting = '';
  if (hour < 6) greeting = '🌙 夜深了，欢迎来到亦然亦航的成长世界';
  else if (hour < 12) greeting = '☀️ 早上好！Let\'s-a go! 亦然亦航正在快乐成长中';
  else if (hour < 14) greeting = '🍅 中午好！来看看双胞胎的趣事吧';
  else if (hour < 18) greeting = '⭐ 下午好！一起见证亦然亦航的成长冒险';
  else greeting = '🌙 晚上好！欢迎来到亦然亦航的成长日记';

  // 首次访问欢迎
  if (!localStorage.getItem('marioVisited')) {
    setTimeout(() => {
      if (typeof Snackbar !== 'undefined') {
        Snackbar.show({
          text: greeting,
          pos: 'bottom-right',
          duration: 5000,
          bg: '#E52521',
          textColor: '#FFFFFF'
        });
      }
      localStorage.setItem('marioVisited', 'true');
    }, 1500);
  }

  // ===============================
  // 5. 阅读进度条 - 马里奥配色
  // ===============================
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.style.background = 'linear-gradient(90deg, #E52521, #FBD000, #43B047, #049CD8)';
  }

  // ===============================
  // 6. 图片点击 - 马里奥金币效果
  // ===============================
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', function(e) {
      // 金币效果
      const rect = this.getBoundingClientRect();
      createCoinEffect(rect.left + rect.width / 2, rect.top);

      if (typeof Snackbar !== 'undefined' && this.alt) {
        Snackbar.show({
          text: '🪙 ' + this.alt,
          pos: 'top-center',
          duration: 2000,
          bg: '#FBD000',
          textColor: '#C84C0C'
        });
      }
    });
  });

  // ===============================
  // 7. 鼠标点击星星效果
  // ===============================
  let clickCount = 0;
  document.addEventListener('click', function(e) {
    clickCount++;
    // 每3次点击产生星星
    if (clickCount % 3 === 0) {
      const star = document.createElement('div');
      star.className = 'mario-star';
      star.textContent = ['⭐', '🌟', '✨', '💫'][Math.floor(Math.random() * 4)];
      star.style.left = e.clientX + 'px';
      star.style.top = e.clientY + 'px';
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 1000);
    }
  });

  // ===============================
  // 8. 季节装饰 - 马里奥风格
  // ===============================
  const month = new Date().getMonth() + 1;
  let seasonalEmoji = '';
  if (month >= 3 && month <= 5) seasonalEmoji = '🌸';
  else if (month >= 6 && month <= 8) seasonalEmoji = '🌻';
  else if (month >= 9 && month <= 11) seasonalEmoji = '🍂';
  else seasonalEmoji = '❄️';

  // 在网站标题旁添加季节emoji
  const siteTitle = document.querySelector('#site-title, #site-name');
  if (siteTitle && seasonalEmoji) {
    const originalTitle = siteTitle.textContent;
    siteTitle.innerHTML = originalTitle + ' ' + seasonalEmoji;
  }

  // ===============================
  // 9. 控制台彩蛋
  // ===============================
  console.log('%c🍄 亦然亦航 🍄', 
    'font-size: 24px; color: #E52521; font-weight: bold; text-shadow: 2px 2px 0 #C84C0C;'
  );
  console.log('%c★ 超级马里奥双胞胎成长博客 ★', 'font-size: 14px; color: #049CD8;');
  console.log('%cWahoo! 欢迎来到我们的成长世界！', 'font-size: 12px; color: #43B047;');
  console.log('%cLet\'s-a go! 🪙⭐🍄', 'font-size: 14px; color: #FBD000;');

  // ===============================
  // 10. 文章卡片点击 - 管道音效模拟（视觉）
  // ===============================
  document.querySelectorAll('.recent-post-item').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-6px) scale(1.01)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // ===============================
  // 初始化右侧按钮、评论区、分享
  // ===============================
  setTimeout(function() {
    createFloatHomeButton();
    addRightsideCommentButton();
    initCommentSection();
    initShareButtons();
  }, 300);
});

// Pjax 重载
document.addEventListener('pjax:success', function() {
  // 修复图片
  fixBrokenImages();

  // 重新执行双胞胎标识
  document.querySelectorAll('#article-container').forEach(article => {
    const html = article.innerHTML;
    article.innerHTML = html
      .replace(/\[亦然\]/g, '<span class="tag-yr">🍄 亦然</span>')
      .replace(/\[亦航\]/g, '<span class="tag-yh">⭐ 亦航</span>')
      .replace(/\[里程碑\]/g, '<span class="milestone">🏆 里程碑</span>');
  });

  // 重新绑定图片点击
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', function(e) {
      if (typeof Snackbar !== 'undefined' && this.alt) {
        Snackbar.show({
          text: '🪙 ' + this.alt,
          pos: 'top-center',
          duration: 2000,
          bg: '#FBD000',
          textColor: '#C84C0C'
        });
      }
    });
  });

  // 重新初始化右侧按钮和评论区
  createFloatHomeButton();
  addRightsideCommentButton();
  initCommentSection();
  initShareButtons();
  setTimeout(fixBrokenImages, 300);
});

// ===============================
// 11. 独立浮动"回到首页"按钮 - 不依赖rightside容器
// ===============================
function createFloatHomeButton() {
  if (document.querySelector('.float-home-btn')) return;
  
  var homeBtn = document.createElement('a');
  homeBtn.className = 'float-home-btn';
  homeBtn.href = '/';
  homeBtn.title = '回到首页';
  homeBtn.innerHTML = '<i class="fas fa-home"></i>';
  document.body.appendChild(homeBtn);
}

// 添加评论按钮到 rightside（如果存在）
function addRightsideCommentButton() {
  if (document.querySelector('#rightside .go-comment-btn')) return;
  
  var rightside = document.querySelector('#rightside-config-hide');
  if (!rightside) return;
  
  var commentBtn = document.createElement('button');
  commentBtn.className = 'go-comment-btn';
  commentBtn.type = 'button';
  commentBtn.title = '发表评论';
  commentBtn.innerHTML = '<i class="fas fa-comments"></i>';
  commentBtn.style.cssText = 'color:#43B047;transition:all 0.3s;';
  commentBtn.addEventListener('click', function(e){
    e.preventDefault();
    var commentEl = document.getElementById('comments-section');
    if (!commentEl) commentEl = document.querySelector('#post-comment, .comment-container, #comment');
    if (commentEl) {
      commentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  });
  
  var firstChild = rightside.firstChild;
  if (firstChild) {
    rightside.insertBefore(commentBtn, firstChild);
  } else {
    rightside.appendChild(commentBtn);
  }
}

// ===============================
// 12. 评论留言区
// ===============================
function initCommentSection() {
  // 只在文章页面添加
  const article = document.querySelector('#article-container');
  if (!article) return;
  if (document.querySelector('.custom-comment-section')) return;
  
  const section = document.createElement('div');
  section.className = 'custom-comment-section';
  section.id = 'comments-section';
  section.innerHTML = `
    <h3>🍄 留下你的留言</h3>
    <div class="comment-form">
      <div class="form-row">
        <input type="text" id="comment-nickname" placeholder="你的昵称" maxlength="20">
        <input type="email" id="comment-email" placeholder="邮箱（不会公开）">
      </div>
      <textarea id="comment-body" placeholder="写下你想对亦然亦航说的话..."></textarea>
      <div style="margin-top:10px;text-align:right">
        <button class="comment-submit" onclick="submitComment()">🍄 发 送 留 言</button>
      </div>
    </div>
    <div class="comment-list" id="comment-list"></div>
  `;
  article.appendChild(section);
  
  // 加载已有留言
  loadComments();
}

function loadComments() {
  const comments = JSON.parse(localStorage.getItem('yryh_comments') || '[]');
  const list = document.getElementById('comment-list');
  if (!list) return;
  
  if (comments.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#999;padding:20px">还没有留言，来做第一个评论的人吧！⭐</p>';
    return;
  }
  
  list.innerHTML = comments.map((c, i) => `
    <div class="comment-item">
      <div class="comment-author">⭐ ${escapeHtml(c.nickname)} <span class="comment-time">${escapeHtml(c.time)}</span></div>
      <div class="comment-body">${escapeHtml(c.body)}</div>
    </div>
  `).join('');
}

function submitComment() {
  const nickname = document.getElementById('comment-nickname').value.trim();
  const body = document.getElementById('comment-body').value.trim();
  
  if (!nickname) { alert('请输入你的昵称！'); return; }
  if (!body) { alert('请输入留言内容！'); return; }
  
  const comments = JSON.parse(localStorage.getItem('yryh_comments') || '[]');
  comments.unshift({
    nickname: nickname,
    body: body,
    time: new Date().toLocaleString('zh-CN')
  });
  
  // 保留最近50条
  const recent = comments.slice(0, 50);
  localStorage.setItem('yryh_comments', JSON.stringify(recent));
  
  document.getElementById('comment-body').value = '';
  loadComments();
  showShareToast('留言发送成功！🌟');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showShareToast(msg) {
  let toast = document.querySelector('.toast-share');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-share';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===============================
// 13. 社交分享转发功能
// ===============================
function initShareButtons() {
  const article = document.querySelector('#article-container');
  if (!article) return;
  
  // 1. 在 Butterfly 自带的分享区域添加"复制链接"按钮
  var socialShare = document.querySelector('.post-share .social-share');
  if (socialShare && !socialShare.querySelector('.copy-link-btn')) {
    var copyBtn = document.createElement('a');
    copyBtn.className = 'copy-link-btn';
    copyBtn.href = 'javascript:void(0)';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制链接';
    copyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      copyShareLink();
    });
    socialShare.appendChild(copyBtn);
  }
  
  // 2. 如果没有自带分享区，创建自定义分享区
  if (document.querySelector('.share-container')) return;
  if (!socialShare) {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(document.title);
    
    const container = document.createElement('div');
    container.className = 'share-container';
    container.innerHTML = `
      <h4>📤 转发这篇文章</h4>
      <div class="share-buttons">
        <button class="share-btn share-btn-wechat" onclick="shareToWeixin()">
          <i class="fab fa-weixin"></i> 微信
        </button>
        <button class="share-btn share-btn-qq" onclick="shareToQQ()">
          <i class="fab fa-qq"></i> QQ
        </button>
        <button class="share-btn share-btn-weibo" onclick="shareToWeibo()">
          <i class="fab fa-weibo"></i> 微博
        </button>
        <button class="share-btn share-btn-douyin" onclick="shareToDouyin()">
          <i class="fab fa-tiktok"></i> 抖音
        </button>
        <button class="share-btn share-btn-copy" onclick="copyShareLink()">
          <i class="fas fa-copy"></i> 复制链接
        </button>
      </div>
    `;
    
    const commentSection = document.getElementById('comments-section');
    if (commentSection) {
      article.insertBefore(container, commentSection);
    } else {
      article.appendChild(container);
    }
  }
  
  // 添加微信二维码弹窗到 body
  if (!document.getElementById('weixin-qr-popup')) {
    const popup = document.createElement('div');
    popup.id = 'weixin-qr-popup';
    popup.className = 'qr-popup';
    popup.innerHTML = `
      <div class="qr-popup-content">
        <h3 style="color:#07C160;margin-bottom:10px"><i class="fab fa-weixin"></i> 微信扫一扫分享</h3>
        <div id="weixin-qr-code"></div>
        <p style="color:#999;font-size:13px;margin:10px 0">打开微信扫一扫，分享给朋友</p>
        <button onclick="closeWeixinQR()">关 闭</button>
      </div>
    `;
    document.body.appendChild(popup);
  }
}

function shareToWeixin() {
  const popup = document.getElementById('weixin-qr-popup');
  const qrDiv = document.getElementById('weixin-qr-code');
  qrDiv.innerHTML = '';
  
  // 使用简单的二维码生成 (Google Charts API)
  const qrImg = document.createElement('img');
  qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(window.location.href);
  qrImg.style.width = '200px';
  qrImg.style.height = '200px';
  qrDiv.appendChild(qrImg);
  
  popup.classList.add('show');
}

function closeWeixinQR() {
  document.getElementById('weixin-qr-popup').classList.remove('show');
}

function shareToQQ() {
  const url = 'https://connect.qq.com/widget/shareqq/index.html?url=' + encodeURIComponent(window.location.href) + '&title=' + encodeURIComponent(document.title) + '&desc=' + encodeURIComponent('亦然亦航 - 双胞胎成长博客');
  window.open(url, '_blank', 'width=600,height=500');
}

function shareToWeibo() {
  const url = 'https://service.weibo.com/share/share.php?url=' + encodeURIComponent(window.location.href) + '&title=' + encodeURIComponent('亦然亦航 - ' + document.title);
  window.open(url, '_blank', 'width=600,height=500');
}

function shareToDouyin() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showShareToast('链接已复制！打开抖音粘贴分享给你的好友 🎵');
  }).catch(() => {
    showShareToast('复制链接后，打开抖音分享给好友吧！🎵');
  });
}

function copyShareLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showShareToast('链接已复制！可以粘贴分享给朋友 📋');
  }).catch(() => {
    showShareToast('链接复制成功！📋');
  });
}

// 点击弹窗空白处关闭
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'weixin-qr-popup') {
    closeWeixinQR();
  }
});

// ===============================
// 14. 初始化
// ===============================
createFloatHomeButton();
addRightsideCommentButton();
initCommentSection();
initShareButtons();

// 确保 DOM 完全加载后再执行一次
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      createFloatHomeButton();
      addRightsideCommentButton();
      initCommentSection();
      initShareButtons();
    }, 500);
  });
} else {
  // DOM 已经加载完成
  setTimeout(function() {
    createFloatHomeButton();
    addRightsideCommentButton();
    initCommentSection();
    initShareButtons();
  }, 500);
}
