// src/utils/push.js
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
 * registerServiceWorkerAndSubscribe - register SW, request permission, subscribe and send subscription to backend
 * @param {String} token - bearer token for API authentication
 * @param {String} vapidPublicKey - (optional) if not passed will fetch from server
 */
export async function registerAndSubscribe(token, vapidPublicKey) {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
    }
    if (!('PushManager' in window)) {
        throw new Error('Push API not supported');
    }

    // register sw (path relative to root)
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered', reg);

    // ask permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
    }

    // get public key from server if not provided
    if (!vapidPublicKey) {
        const res = await fetch('/api/push/vapidPublicKey');
        const j = await res.json();
        vapidPublicKey = j.publicKey;
    }

    // subscribe
    const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // send subscription to backend
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
 * unsubscribePush - unregister on server and client
 */
export async function unsubscribePush(token) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;

    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    // remove on server
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
