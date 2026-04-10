
// firebase-messaging-sw.js
// This file is crucial for Firebase Cloud Messaging (FCM) to work correctly for background notifications.
// It MUST be a separate file located in the root directory of your website.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by copying your project's config
// Make sure these match the firebaseConfig in your main HTML file.
const firebaseConfig = {
  apiKey: "AIzaSyDulYuUV4Km2e67SSzveNl9poq90-EhkU8",
  authDomain: "zigzoog-5708f.firebaseapp.com",
  projectId: "zigzoog-5708f",
  storageBucket: "zigzoog-5708f.firebasestorage.app",
  messagingSenderId: "1072366260486",
  appId: "1:1072366260486:web:fdd7a8c160ff8760ab8e87"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle incoming messages while the app is in the background.
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // Use the provided logo as the icon for system notifications
    icon: payload.notification.icon || 'https://scontent.flhe2-4.fna.fbcdn.net/v/t39.30808-6/668669594_122116458531233257_3345747139197208070_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeF-LTIJU9ySRcVa4sV0zysv_dH8l3Arfcz90fyXcCt9zMU9bORgm3rjWOKvTklnBE04bbhuk5nK0_3egvxhdRqT&_nc_ohc=U5WNLwU6hd8Q7kNvwHghVlF&_nc_oc=AdqOJ-Ac1llHmmPRDxgBVf7J7gLG9P4mJhMZUh2J5-_-KlcgAxV4XexlaGhA6UkanPw&_nc_zt=23&_nc_ht=scontent.flhe2-4.fna&_nc_gid=BL8LM-J3NYqKGiMOIqduPw&_nc_ss=7a3a8&oh=00_Af1nBC-TKukubOfGDW25DChFv9kr8WWaS3swFjQhYzAlaA&oe=69DD3C45',
    data: {
      url: payload.notification.click_action || '/' // Optional: define where to go on click
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification

  let click_url = event.notification.data.url || '/'; // Get URL from notification data or default to homepage

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          // If there's already a window open, focus it and navigate
          if (client.url === click_url && 'focus' in client) {
            return client.focus().then(() => client.navigate(click_url));
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(click_url);
        }
      })
  );
});

