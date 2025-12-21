/**
 * Push notification utility module.
 * Provides Web Push API subscription and unsubscription functionality.
 */

/**
 * Convert base64 VAPID public key to Uint8Array for Push API.
 * @param {string} base64String - Base64 encoded VAPID public key
 * @returns {Uint8Array} Decoded key as byte array
 */
export function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Register Service Worker, request notification permission, and subscribe to push notifications.
 * Sends subscription data to the backend for future push delivery.
 * @param {string} token - Bearer token for API authentication
 * @param {string} [vapidPublicKey] - VAPID public key; fetched from server if not provided
 * @returns {Promise<PushSubscription>} The registered push subscription
 * @throws {Error} If Service Worker, Push API not supported, or subscription fails
 */
export async function registerAndSubscribe(token, vapidPublicKey) {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
    }
    if (!('PushManager' in window)) {
        throw new Error('Push API not supported');
    }

    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered', reg);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
    }

    if (!vapidPublicKey) {
        const res = await fetch('/api/push/vapidPublicKey');
        const j = await res.json();
        vapidPublicKey = j.publicKey;
    }

    const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    const payload = {
        endpoint: sub.endpoint,
        keysJson: JSON.stringify(sub.toJSON().keys)
    };

    const resp = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
    });

    if (!resp.ok) {
        throw new Error('Failed to register subscription on server');
    }

    return sub;
}

/**
 * Unsubscribe from push notifications on both client and server.
 * @param {string} token - Bearer token for API authentication
 * @returns {Promise<void>}
 */
export async function unsubscribePush(token) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;

    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ endpoint: sub.endpoint })
    });

    await sub.unsubscribe();
    console.log('Unsubscribed from push');
}
