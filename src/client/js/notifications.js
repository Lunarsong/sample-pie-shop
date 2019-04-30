/**
 *
 *  Online store PWA sample.
 *  Copyright 2017 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

import pageInit from './page-init';
import { PUBLIC_VAPID_KEY } from '../../server/firebase-admin-key.js';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function checkRegistration() {
  if (!('serviceWorker' in navigator && 'PushManager' in window)) {
    console.log('Browser doesn\'t support push.');
    return;
  } 
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.log('No service worker registered. Can\'t do push.');
    return;
  }
  return registration;
}

function userWantsNotifications() {
  let notifydeals = document.querySelector('#notifydeals');
  let notifyorders = document.querySelector('#notifyorders');
  let notifyproducts = document.querySelector('#notifyproducts');  

  if (notifydeals.checked || notifyorders.checked || notifyproducts.checked ) {
    return true;
  } else return false;
}

async function updatePushSettings(registration) {
  if (userWantsNotifications()) {
    let result = await Notification.requestPermission();
    if (result === 'granted') {
      let subscription = await registration.pushManager.subscribe({
        'applicationServerKey': urlB64ToUint8Array(PUBLIC_VAPID_KEY),
        'userVisibleOnly': true
      });
    } else if(result === 'denied') {
      console.log('denied');
    }
  } else {
    console.log('User does not want notifications');
  }
}

function initializeNotificationsPage() {
  console.log('Initializing page');
  pageInit();
  window.addEventListener('unsubscribe', async () => {
    let registration = await navigator.serviceWorker.getRegistration();
    let subscription = await registration.pushManager.getSubscription();
    if(subscription) {
      subscription.unsubscribe();
    }
  });
  
  checkRegistration().then(registration => {
    updatePushSettings(registration);
  });

}



function testNotifications() {
  window.addEventListener('notifications-test', async () => {
    let registration = await navigator.serviceWorker.getRegistration();
    let randy = Math.floor( Math.random() * 100);
    let title = 'Title of Test-' + randy;
    let options = {
      badge: '../images/icons/logo24.svg',
      body: 'body of Test-' + randy,
      icon: '../images/icons/logo24.svg',
      image: '../images/icons/logo24.svg',
      tag: 'Test-' + randy,
      data: randy < 33 ? 'products' : randy < 66 ? 'deals' : 'orders'
    }
    console.log(title, options.data);
    if(options.data === 'products')
    { registration.showNotification(title, options); }
  });
}

    /* 
    //let registration = await navigator.serviceWorker.getRegistration();

    let randy = Math.floor( Math.random() * 100);
    let title = 'Title of Test-' + randy;
    let options = {
      /* 
      actions: [{
        action: 'actions[0].action',
        title: 'actions[0].title',
        icon: '../images/icons/logo24.svg'
      }],
      
      

      badge: '../images/icons/logo24.svg',
      body: 'body of Test-' + randy,
      //dir: 'auto',
      icon: '../images/icons/logo24.svg',
      image: '../images/icons/logo24.svg',
      //lang: 'en-US',
      //requireInteraction: true,
      tag: 'Test-' + randy,
      //vibrate: [100, 100, 100],
      data: randy < 33 ? 'products' : randy < 66 ? 'deals' : 'orders'
    };
    console.log(options);
    //registration.showNotification(title, options);
  });
}
*/

export default function init() {
  initializeNotificationsPage();
  testNotifications();
}



  /* 
  // Get the user's updated notifications settings.
  let notifydeals = document.querySelector('#notifydeals');
  let notifyorders = document.querySelector('#notifyorders');
  let notifyproducts = document.querySelector('#notifyproducts'); 

  // Check that the user wants at least one type of push notification.
  if (notifydeals.checked || notifyorders.checked || notifyproducts.checked ) {
    console.log('User wants at least one notification type.');
    
    if (!subscription) {
      console.log('Requesting permission to subscribe user to push.');

      let result = await Notification.requestPermission();

      if (result === 'granted') {
        console.log('Permission granted. Subscribing user to push.');

        subscription = await registration.pushManager.subscribe({
          'applicationServerKey': urlB64ToUint8Array(PUBLIC_VAPID_KEY),
          'userVisibleOnly': true
        });

      } else if(result === 'denied') {

        console.log('Permission denied.');

        /* 
        let statusmessage = document.querySelector('#statusmessage');  
        statusmessage.textContent = 
          'Can\'t enable notifications because push is blocked.';
        */
        /** 
        let notifydeals = document.querySelector('#notifydeals');
        let notifyorders = document.querySelector('#notifyorders');
        let notifyproducts = document.querySelector('#notifyproducts'); 

        notifydeals.checked = false;
        notifyorders.checked = false;
        notifyproducts.checked = false;

        notifydeals.disabled = true;
        notifyorders.disabled = true;
        notifyproducts.disabled = true;

        let updateButton = document.querySelector('#update');
        updateButton.disabled = true;
        */
      /* 
      }
    }
  } else {
    console.log('User doesn\'t want any notifications.');
  }

  if (subscription) {
    console.log('Push subscription exists. Endpoint:');
    console.log(subscription.endpoint);
  }
}
*/


/* 
  if(subscription) {
    let unsubscribeButton = document.querySelector('#unsubscribe');
    unsubscribeButton.disabled = false;
  }
  */