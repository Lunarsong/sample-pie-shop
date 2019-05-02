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

async function checkSubscription(registration) {
  let subscription = false;
  if (registration) {
    subscription = await registration.pushManager.getSubscription()
    .catch(error => {
      console.log(error);
      return false;
    });
  }
  if (subscription) {
    setCookie('endpoint', subscription.endpoint);
  } else {
    deleteCookie('endpoint');
  }
  return subscription;
}

function setCookie(cookieName, cookieValue) {
  document.cookie = `${cookieName}=${cookieValue}`;
}

function getCookie(cookieName) {  
  let cookieValue = '';
  let cookiesAsArray = document.cookie.split(';');

  cookiesAsArray.map(cookie => {
    cookie = cookie.trim();
    if (cookie.startsWith(cookieName)) {
      cookieValue = cookie.split('=')[1];
    }
  });
  return cookieValue;
}

function deleteCookie(cookieName) {
  document.cookie = `${cookieName}=`;
}

function getPreferences() {
  let notifydeals = document.querySelector('#notifydeals').checked;
  let notifyorders = document.querySelector('#notifyorders').checked;
  let notifyproducts = document.querySelector('#notifyproducts').checked;  

  let preferences = { 
    notifydeals: notifydeals,
    notifyorders: notifyorders,
    notifyproducts: notifyproducts
  };
  return preferences;
}

async function subscribeToPush(registration) {
  await registration.pushManager.subscribe({
    'applicationServerKey': urlB64ToUint8Array(PUBLIC_VAPID_KEY),
    'userVisibleOnly': true
  }).catch(error => {
    console.log(error);
    return false;
  });
  return await checkSubscription(registration);
}

function sendDataToSW(data) {
  console.log(data);
  if (navigator.serviceWorker.controller) { 
    navigator.serviceWorker.controller.postMessage(data); 
  } else {
    console.log('No navigator.serviceworker.controller');
  }
}

function getDataFromSW() {
  return {};
}

async function pageSetup(subscription, preferences) {

  let togglepush = document.querySelector('#togglepush');
  let preferencesform = document.querySelector('#preferences');
  let updatebutton = document.querySelector('#update');
  let notifydeals = document.querySelector('#notifydeals');
  let notifyorders = document.querySelector('#notifyorders');
  let notifyproducts = document.querySelector('#notifyproducts'); 
  
  notifydeals.checked = preferences.notifydeals;
  notifyproducts.checked = preferences.notifyproducts;
  notifyorders.checked = preferences.notifyorders;

  if(subscription) {
    togglepush.checked = true;
    preferencesform.classList = '';
    updatebutton.disabled = false;
    notifydeals.disabled = false;
    notifyproducts.disabled = false;
    notifyorders.disabled = false;
  } else {
    togglepush.checked = false;
    preferencesform.classList = 'nopush';
    updatebutton.disabled = true;
    notifydeals.disabled = true;
    notifyproducts.disabled = true;
    notifyorders.disabled = true;
  }
}

async function initializeNotificationsPage() {
  pageInit();

  let preferences = { 
    notifydeals: true,
    notifyorders: true,
    notifyproducts: true
  };
  
  window.addEventListener('push-change', handlePushChange);
  window.addEventListener('data-update', handleDataUpdate);
  
  let registration = await checkRegistration();
  let subscription = await checkSubscription(registration);  

  if (registration) {
    if (subscription) {
      setCookie('endpoint', subscription.endpoint);
      if (getCookie('preferences')) {
        preferences = JSON.parse(getCookie('preferences'));
      }
    }
  } 

  setCookie('preferences', JSON.stringify(preferences));
  pageSetup(subscription, preferences);
  sendDataToSW({ preferences: preferences });
}

async function handlePushChange() {
  let userWantsPush = document.querySelector('#togglepush').checked;
  let registration = await checkRegistration();
  let subscription = await checkSubscription(registration);
  let preferences = getPreferences();

  if (subscription && userWantsPush) {
    //console.log(subscription.endpoint);
  }

  if (subscription && !userWantsPush) {
    await subscription.unsubscribe().catch(error => {
      console.log(error);
      return false;
    });
    checkSubscription(registration);
  }

  if ((!subscription) && userWantsPush) {
    await subscribeToPush(registration);
  }
  
  if ((!subscription) && (!userWantsPush)) {
    //console.log('No subscription and user does not want one. Nothing to do.');
  }
  pageSetup(subscription, preferences);
}

async function handleDataUpdate(event) {
  console.log('handling data update');
  console.log(event.detail.data);
}



function testNotifications() {
  window.addEventListener('notifications-test', async () => {
    let randy = Math.floor( Math.random() * 100);
    let title = 'Title of Test-' + randy;
    let options = {
      badge: '../images/icons/logo24.svg',
      body: 'body of Test-' + randy,
      icon: '../images/icons/logo24.svg',
      image: '../images/icons/logo24.svg',
      tag: 'Test-' + randy,
      data: randy < 33 ? 'notifyproducts' : randy < 66 ? 'notifydeals' : 'notifyorders'
    }

    navigator.serviceWorker.dispatchEvent(new Event('push', { 
      title: title, options: options
    })); 
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