/* ===============================
 * 亦然亦航 - 马里奥兄弟主题交互脚本
 * 超级马里奥风格的可爱儿童博客
 * =============================== */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {

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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        entry.target.style.animation = 'pipeRise 0.6s ease';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.recent-post-item, .category-list-item, .tag-cloud-list a').forEach(el => {
    observer.observe(el);
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
});

// Pjax 重载
document.addEventListener('pjax:success', function() {
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
});
