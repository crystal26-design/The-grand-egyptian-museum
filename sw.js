// sw.js - 离线缓存核心脚本（v3：预生成 mp3 讲解版）
const CACHE_NAME = 'abusimbel-offline-v3';

// 必须预缓存的页面外壳（install 阶段任一失败会导致整个 SW 安装失败，只放最核心的两项）
const SHELL_TO_CACHE = [
  '/',
  '/index.html'
];

// 全部展品图 / 展区图（逐张尝试缓存，单张 404 不会拖垮安装）
const IMAGES_TO_CACHE = [
  'images/shared/item01.jpg',
  'images/shared/item02.jpeg',
  'images/shared/item03.jpg',
  'images/shared/item04.png',
  'images/shared/item05.png',
  'images/shared/item06.jpg',
  'images/shared/item07.png',
  'images/shared/item08.png',
  'images/shared/item09.jpg',
  'images/shared/item10.jpg',
  'images/shared/item11.png',
  'images/shared/item12.png',
  'images/shared/item13.png',
  'images/shared/item14.jpg',
  'images/shared/item15.png',
  'images/shared/item16.jpg',
  'images/shared/item18.jpg',
  'images/shared/item19.png',
  'images/shared/item20.png',
  'images/shared/item21.jpg',
  'images/shared/item22.png',
  'images/shared/item23.jpg',
  'images/shared/item24.jpg',
  'images/shared/item25.png',
  'images/shared/item26.png',
  'images/shared/item27.png',
  'images/shared/item28.png',
  'images/shared/item29.png',
  'images/shared/item30.png',
  'images/shared/item31.png',
  'images/shared/item32.png',
  'images/shared/item33.png',
  'images/shared/item34.jpg',
  'images/shared/item35.png',
  'images/shared/item36.png',
  'images/shared/item37.png',
  'images/shared/item38.png',
  'images/shared/item39.png',
  'images/shared/item40.jpg',
  'images/shared/item41.png',
  'images/shared/item42.jpg',
  'images/shared/item43.png',
  'images/shared/item44.png',
  'images/shared/zone1.jpg',
  'images/shared/zone2.jpg',
  'images/shared/zone3.jpg',
  'images/shared/zone4.png',
  'images/shared/zone5.jpg',
  'images/shared/zone6.jpg'
];

// 全部讲解音频（预生成 mp3，离线可听；逐条尝试，失败单独跳过）
const AUDIO_TO_CACHE = [
  '/audio/zh/item01.mp3',
  '/audio/zh/item02.mp3',
  '/audio/zh/item03.mp3',
  '/audio/zh/item04.mp3',
  '/audio/zh/item05.mp3',
  '/audio/zh/item06.mp3',
  '/audio/zh/item07.mp3',
  '/audio/zh/item08.mp3',
  '/audio/zh/item09.mp3',
  '/audio/zh/item10.mp3',
  '/audio/zh/item11.mp3',
  '/audio/zh/item12.mp3',
  '/audio/zh/item13.mp3',
  '/audio/zh/item14.mp3',
  '/audio/zh/item15.mp3',
  '/audio/zh/item16.mp3',
  '/audio/zh/item18.mp3',
  '/audio/zh/item19.mp3',
  '/audio/zh/item20.mp3',
  '/audio/zh/item21.mp3',
  '/audio/zh/item22.mp3',
  '/audio/zh/item23.mp3',
  '/audio/zh/item24.mp3',
  '/audio/zh/item25.mp3',
  '/audio/zh/item26.mp3',
  '/audio/zh/item27.mp3',
  '/audio/zh/item28.mp3',
  '/audio/zh/item29.mp3',
  '/audio/zh/item30.mp3',
  '/audio/zh/item31.mp3',
  '/audio/zh/item32.mp3',
  '/audio/zh/item33.mp3',
  '/audio/zh/item34.mp3',
  '/audio/zh/item35.mp3',
  '/audio/zh/item36.mp3',
  '/audio/zh/item37.mp3',
  '/audio/zh/item38.mp3',
  '/audio/zh/item39.mp3',
  '/audio/zh/item40.mp3',
  '/audio/zh/item41.mp3',
  '/audio/zh/item42.mp3',
  '/audio/zh/item43.mp3',
  '/audio/zh/item44.mp3',
  '/audio/zh/zone1.mp3',
  '/audio/zh/zone2.mp3',
  '/audio/zh/zone3.mp3',
  '/audio/zh/zone4.mp3',
  '/audio/zh/zone5.mp3',
  '/audio/zh/zone6.mp3'
];

// 1. 安装阶段：缓存页面外壳 + 逐张下载图片
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('正在预缓存页面外壳与全部图片资源...');
      // 外壳用 addAll（缺一不可）
      return cache.addAll(SHELL_TO_CACHE).then(() => {
        // 图片逐张 put，失败单独跳过
        return Promise.all(
          IMAGES_TO_CACHE.concat(AUDIO_TO_CACHE).map(url =>
            cache.add(url).catch(err =>
              console.warn('资源缓存失败(已跳过):', url)
            )
          )
        );
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. 激活阶段：清理旧版本缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 拦截请求：缓存优先，离线可用
self.addEventListener('fetch', event => {
  // AI 对话接口不拦截（必须联网）
  if (event.request.url.includes('/api/chat')) {
    return;
  }
  // 非 GET 请求不拦截
  if (event.request.method !== 'GET') {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 优先使用本地缓存，没有缓存再走网络下载
      return cachedResponse || fetch(event.request);
    })
  );
});
