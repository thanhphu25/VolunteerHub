// public/sw.js

// Lắng nghe sự kiện 'push' (khi nhận được tin nhắn từ server)
self.addEventListener('push', event => {
  let data;
  try {
    // Backend của bạn gửi payload dạng JSON (Map<String, Object>)
    // nên chúng ta cần parse nó
    data = event.data.json();
  } catch (e) {
    console.error('Push event data error:', e);
    data = {
      title: 'Thông báo mới',
      message: event.data.text() // Hiển thị text thô nếu không phải JSON
    };
  }

  console.log('Push Received:', data);

  const title = data.title || 'Thông báo từ VolunteerHub';
  const options = {
    body: data.message || 'Bạn có thông báo mới.',
    icon: '/vite.svg', // Bạn có thể thay bằng logo của mình (ví dụ: /logo.png)
    badge: '/vite.svg', // Icon nhỏ trên thanh thông báo (Android)
    data: {
      // Gắn link mà backend gửi kèm (nếu có) để xử lý khi click
      url: data.url || '/'
    }
  };

  // Yêu cầu trình duyệt hiển thị thông báo
  event.waitUntil(self.registration.showNotification(title, options));
});

// Lắng nghe sự kiện 'notificationclick' (khi người dùng bấm vào thông báo)
self.addEventListener('notificationclick', event => {
  console.log('Notification click Received.', event.notification.data);

  // Đóng thông báo lại
  event.notification.close();

  // Mở đường link (URL) đã được đính kèm trong data
  event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
  );
});