importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB3RzIRvL0xGtminZ3RMDxKHyA6eMtgWN4",
  authDomain: "happy-fd1bc.firebaseapp.com",
  databaseURL: "https://happy-fd1bc-default-rtdb.firebaseio.com",
  projectId: "happy-fd1bc",
  storageBucket: "happy-fd1bc.firebasestorage.app",
  messagingSenderId: "426245078000",
  appId: "1:426245078000:web:d94566ffb8a7230385bb35",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title = "WildSphere", body = "You have a new notification" } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: payload.data,
  });
});
