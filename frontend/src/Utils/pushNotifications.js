// src/utils/pushNotifications.js
import axiosClient from '../api/axiosClient'; // Import axiosClient để gọi API
import {toast} from 'react-toastify';

/**
 * Chuyển đổi VAPID public key (Base64 URL) thành Uint8Array.
 * Đây là định dạng bắt buộc mà PushManager yêu cầu.
 * @param {string} base64String
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
  .replace(/-/g, '+')
  .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Gửi thông tin subscription lên backend server.
 * @param {PushSubscription} subscription - Đối tượng subscription từ trình duyệt.
 */
async function sendSubscriptionToBackend(subscription) {
  try {
    // Chuyển subscription về định dạng JSON mà backend mong muốn
    const subData = subscription.toJSON();
    const payload = {
      endpoint: subData.endpoint,
      // Backend mong muốn keysJson là một chuỗi JSON
      keysJson: JSON.stringify(subData.keys)
    };

    // Gọi API /push/subscribe
    await axiosClient.post('/push/subscribe', payload);
    console.log('Subscription đã được gửi lên backend.');
  } catch (error) {
    console.error('Lỗi khi gửi subscription lên backend:', error);
    // Không cần báo lỗi cho user ở đây, backend có thể tự xử lý
  }
}

/**
 * Hàm chính: Xin quyền và đăng ký nhận thông báo đẩy.
 * @returns {Promise<PushSubscription|null>}
 */
export async function subscribeToPushNotifications() {
  // 1. Kiểm tra trình duyệt có hỗ trợ Service Worker và Push API không
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push Messaging không được hỗ trợ trên trình duyệt này.');
    toast.warn('Trình duyệt không hỗ trợ nhận thông báo.');
    return null;
  }

  try {
    // 2. Đợi Service Worker (sw.js) sẵn sàng
    const registration = await navigator.serviceWorker.ready;

    // 3. Kiểm tra xem đã đăng ký (subscribed) trước đó chưa
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('Người dùng đã đăng ký (subscribed).');
      // (Tùy chọn) Gửi lại subscription lên backend mỗi lần đăng nhập
      // để đảm bảo backend luôn có thông tin mới nhất
      await sendSubscriptionToBackend(subscription);
      toast.info("Bạn đã đăng ký nhận thông báo.");
      return subscription;
    }

    // 4. Nếu chưa, tiến hành đăng ký mới
    console.log('Người dùng chưa đăng ký. Bắt đầu đăng ký...');

    // 5. Lấy VAPID Public Key từ backend
    // Backend đã cung cấp API này
    const response = await axiosClient.get('/push/vapidPublicKey');
    const vapidPublicKey = response.data.publicKey;
    if (!vapidPublicKey || vapidPublicKey.includes('YOUR_PUBLIC_KEY')) { //
      console.error('VAPID public key chưa được cấu hình ở backend.');
      toast.error('Lỗi cấu hình: Không thể đăng ký thông báo (VAPID key).');
      return null;
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // 6. Xin quyền người dùng và tạo subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Bắt buộc: Phải hiển thị thông báo cho người dùng
      applicationServerKey: applicationServerKey // Key để xác thực
    });

    console.log('Đăng ký mới thành công:', subscription);

    // 7. Gửi subscription mới lên backend
    await sendSubscriptionToBackend(subscription);
    toast.success("Đăng ký nhận thông báo thành công!");
    return subscription;

  } catch (error) {
    console.error('Lỗi khi đăng ký push notification:', error);
    if (Notification.permission === 'denied') {
      // Người dùng đã bấm "Chặn"
      toast.warn(
          'Bạn đã chặn thông báo. Vui lòng bật lại trong cài đặt trình duyệt.');
    } else {
      // Lỗi khác (ví dụ: VAPID key sai,...)
      toast.error('Không thể đăng ký nhận thông báo.');
    }
    return null;
  }
}

/**
 * (Tùy chọn) Hàm hủy đăng ký nhận thông báo.
 * @returns {Promise<void>}
 */
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Gửi yêu cầu hủy lên backend TRƯỚC khi hủy ở client
      const subData = subscription.toJSON();
      const payload = {
        endpoint: subData.endpoint,
        keysJson: JSON.stringify(subData.keys)
      };
      try {
        // Gọi API /push/unsubscribe
        await axiosClient.post('/push/unsubscribe', payload);
        console.log('Đã gửi yêu cầu hủy đăng ký lên backend.');
      } catch (backendError) {
        console.warn('Không thể thông báo cho backend về việc hủy đăng ký:',
            backendError);
      }

      // Hủy đăng ký ở client
      const successful = await subscription.unsubscribe();
      if (successful) {
        console.log('Đã hủy đăng ký (unsubscribe) thành công.');
        toast.info("Đã hủy đăng ký nhận thông báo.");
      } else {
        console.error('Hủy đăng ký (unsubscribe) thất bại.');
        toast.error("Hủy đăng ký nhận thông báo thất bại.");
      }
    }
  } catch (error) {
    console.error('Lỗi khi hủy đăng ký:', error);
    toast.error("Có lỗi xảy ra khi hủy đăng ký.");
  }
}