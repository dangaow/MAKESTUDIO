/* Waline 评论（免登录）
   用动态 import() 加载 ESM 版本：普通 <script defer> 即可引入，file:// 直接打开也不受模块脚本的跨域限制 */
(function(){
  'use strict';
  import('https://unpkg.com/@waline/client@v3/dist/waline.js').then(function(m){
    m.init({
      el: '#waline',
      serverURL: 'https://makestudio-comment.vercel.app',
      lang: 'zh-CN',
      dark: 'html[data-theme="dark"]',
      path: 'index', // 固定评论归属路径，避免 file:// 下产生文件系统路径
      emoji: ['https://unpkg.com/@waline/emojis@1.1.0/weibo'], // 显式完整地址，修复协议相对 URL 变 file:// 的问题
      pageview: false, // 关闭页面访问统计，减少无效后端请求
      locale: { placeholder: '说说你想听的…' }
    });
  }).catch(function(e){
    console.warn('[WALINE] 评论组件加载失败', e && e.message);
  });
})();
