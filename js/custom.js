/* ===============================
 * 亦然亦航 - 自定义交互脚本
 * =============================== */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 添加淡入动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.recent-post-item, .category-list-item, .tag-cloud-list a').forEach(el => {
    observer.observe(el);
  });

  // 双胞胎专属标识
  function addTwinBadges() {
    const articles = document.querySelectorAll('#article-container');
    articles.forEach(article => {
      const html = article.innerHTML;
      // 替换亦然标识
      article.innerHTML = html
        .replace(/\[亦然\]/g, '<span class="tag-yr">亦然</span>')
        .replace(/\[亦航\]/g, '<span class="tag-yh">亦航</span>')
        .replace(/\[里程碑\]/g, '<span class="milestone">里程碑</span>');
    });
  }

  addTwinBadges();

  // 欢迎语
  const hour = new Date().getHours();
  let greeting = '';
  if (hour < 6) greeting = '夜深了，欢迎来到亦然亦航的成长世界';
  else if (hour < 12) greeting = '早上好！亦然亦航正在快乐成长中';
  else if (hour < 14) greeting = '中午好！来看看双胞胎的趣事吧';
  else if (hour < 18) greeting = '下午好！一起见证亦然亦航的成长';
  else greeting = '晚上好！欢迎来到亦然亦航的成长日记';

  // 检查是否是首次访问
  if (!localStorage.getItem('visited')) {
    setTimeout(() => {
      if (typeof Snackbar !== 'undefined') {
        Snackbar.show({
          text: greeting,
          pos: 'bottom-right',
          duration: 5000,
          bg: '#5DADE2'
        });
      }
      localStorage.setItem('visited', 'true');
    }, 1500);
  }

  // 文章阅读进度条颜色
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.style.background = 'linear-gradient(90deg, #5DADE2, #FF6B9D)';
  }

  // 图片点击放大时的可爱提示
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', function() {
      if (typeof Snackbar !== 'undefined' && this.alt) {
        Snackbar.show({
          text: '📸 ' + this.alt,
          pos: 'top-center',
          duration: 2000,
          bg: '#5DADE2'
        });
      }
    });
  });

  // 季节主题装饰
  const month = new Date().getMonth() + 1;
  let seasonalEmoji = '';
  if (month >= 3 && month <= 5) seasonalEmoji = '🌸';      // 春
  else if (month >= 6 && month <= 8) seasonalEmoji = '☀️';  // 夏
  else if (month >= 9 && month <= 11) seasonalEmoji = '🍂';  // 秋
  else seasonalEmoji = '❄️';                                  // 冬

  // 在网站标题旁添加季节emoji
  const siteTitle = document.querySelector('#site-title, #site-name');
  if (siteTitle && seasonalEmoji) {
    const originalTitle = siteTitle.textContent;
    siteTitle.innerHTML = originalTitle + ' ' + seasonalEmoji;
  }

  console.log('%c亦然亦航 %c双胞胎成长博客', 
    'font-size: 24px; color: #5DADE2; font-weight: bold;',
    'font-size: 14px; color: #FF6B9D;'
  );
  console.log('%c欢迎来到我们的成长世界！', 'font-size: 12px; color: #2C3E50;');
});

// Pjax 重载
document.addEventListener('pjax:success', function() {
  if (typeof addTwinBadges === 'function') {
    // 重新执行自定义逻辑
    document.querySelectorAll('#article-container').forEach(article => {
      const html = article.innerHTML;
      article.innerHTML = html
        .replace(/\[亦然\]/g, '<span class="tag-yr">亦然</span>')
        .replace(/\[亦航\]/g, '<span class="tag-yh">亦航</span>')
        .replace(/\[里程碑\]/g, '<span class="milestone">里程碑</span>');
    });
  }
});
