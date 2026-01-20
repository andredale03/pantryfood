import { differenceInDays, parseISO } from 'date-fns';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const checkExpirations = (products) => {
  const today = new Date();
  const expiringProducts = [];
  
  // Recupera lo storico delle notifiche inviate
  const sentNotificationsKey = 'pantry_sent_notifications';
  let sentNotifications = {};
  try {
    sentNotifications = JSON.parse(localStorage.getItem(sentNotificationsKey)) || {};
  } catch (e) {
    console.error("Error parsing sent notifications", e);
  }

  products.forEach(product => {
    // Ignora prodotti consumati o buttati
    if (product.status && product.status !== 'active') return;

    const expiryDate = parseISO(product.expiryDate);
    const daysUntilExpiry = differenceInDays(expiryDate, today);

    // Notifica 3 giorni prima (o meno se non ancora scaduto)
    if (daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
      // Chiave unica per la notifica: ID prodotto + data scadenza
      // Questo permette di rinotificare se la data cambia (es. utente corregge errore)
      const notificationId = `${product.id}_${product.expiryDate}`;
      
      // Se non abbiamo già inviato questa notifica
      if (!sentNotifications[notificationId]) {
        expiringProducts.push({
          ...product,
          daysUntilExpiry
        });
        
        // Segna come inviata
        sentNotifications[notificationId] = new Date().toISOString();
      }
    }
  });

  // Aggiorna lo storage e pulisci chiavi vecchie (opzionale, per ora manteniamo semplice)
  localStorage.setItem(sentNotificationsKey, JSON.stringify(sentNotifications));

  return expiringProducts;
};

export const sendNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    const options = {
      body,
      icon: '/pwa-192x192.png',
      vibrate: [200, 100, 200], // Standard vibration
      badge: '/pwa-192x192.png',
      tag: 'pantry-expiry-alert', // Group notifications
      renotify: true, // Vibrate again even if replacing old notification
      requireInteraction: true, // Keep notification open on desktop/supported mobile
      silent: false
    };

    // Make title alarming
    const alarmingTitle = `🚨 ${title} 🚨`;

    // Prova a usare il Service Worker registration se disponibile per notifiche più robuste su mobile
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(alarmingTitle, options);
      });
    } else {
      // Fallback API standard
      new Notification(alarmingTitle, options);
    }
  }
};
