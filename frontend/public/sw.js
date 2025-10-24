// public/sw.js

// Lắng nghe sự kiện 'push' — khi server gửi push, SW sẽ nhận và hiển thị notification.
self.addEventListener('push', function (event) {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (err) {
        // nếu payload không phải JSON, lấy text
        try { data = { title: 'Thông báo', message: event.data.text() }; } catch(e) { data = { title: 'Thông báo', message: '' }; }
    }

    const title = data.title || 'VolunteerHub';
    const message = data.message || '';
    const url = data.url || '/';
    const payload = data.payload || null;

    const options = {
        body: message,
        data: {
            url,
            payload
        },
        // icon: '/icons/icon-192.png', // nếu bạn có icon trong public
        badge: '/favicon.ico', // optional
        tag: data.tag || undefined, // group notifications nếu muốn
        renotify: data.renotify || false
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Khi user click notification -> mở tab/redirect
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Nếu đã có tab với url, focus
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // nếu không, mở tab mới
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// (Optional) handle notificationclose
self.addEventListener('notificationclose', function (event) {
    // bạn có thể gửi analytics / log về server nếu muốn
});

// (Optional) lifecycle: install/activate — thêm cache nếu cần (static assets caching)
self.addEventListener('install', function (event) {
    // skipWaiting() nếu muốn activate ngay (cẩn thận khi có caching)
    // self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    // clients.claim();
});
