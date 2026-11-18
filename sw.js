/* 문제 트레이너 서비스워커
   - 앱 파일은 캐시하지 않는다(깃허브 페이지에서 항상 최신 코드가 뜨도록 통과만 시킨다).
   - Web Push 수신과 알림 클릭 처리를 준비해 둔다. (푸시 서버는 Cloudflare Worker 등 외부)
*/
const SW_VERSION = 'problem-trainer-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/* 앱에서 직접 알림을 띄울 때 (타이머 종료 등) */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'notify' && data.title) {
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body || '',
        icon: 'icons/icon-192.png',
        badge: 'icons/icon-192.png',
        tag: data.tag || 'problem-trainer',
        data: { url: data.url || './' },
      })
    );
  }
});

/* 외부 푸시 서버(Web Push) 수신 */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || '문제 트레이너';
  const options = {
    body: payload.body || '스파르타 타이머 시간이에요. 1문제 풀고 이어가요.',
    icon: payload.icon || 'icons/icon-192.png',
    badge: payload.badge || 'icons/icon-192.png',
    tag: payload.tag || 'problem-trainer-push',
    renotify: true,
    data: { url: payload.url || './' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/* 알림 클릭 → 앱이 이미 열려 있으면 포커스, 아니면 새로 연다 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        if ('focus' in client) {
          try {
            await client.focus();
            if (client.navigate && client.url !== target) client.navigate(target).catch(() => {});
            return;
          } catch (e) {
            /* 다른 창으로 시도 */
          }
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(target);
    })()
  );
});
