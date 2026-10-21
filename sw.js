// sw.js - 离线缓存核心脚本（v2：纯 Web Speech 语音讲解版，无 mp3）
const CACHE_NAME = 'abusimbel-offline-v2';

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
  'images/shared/item40.png',
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

// 1. 安装阶段：缓存页面外壳 + 逐张下载图片
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('正在预缓存页面外壳与全部图片资源...');
      // 外壳用 addAll（缺一不可）
      return cache.addAll(SHELL_TO_CACHE).then(() => {
        // 图片逐张 put，失败单独跳过
        return Promise.all(IMAGES_TO_CACHE.map(url =>
          cache.add(url).catch(err =>
            console.warn('图片缓存失败(已跳过):', url)
          )
        ));
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
