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

import categories from '../../data/categories';

const notifications = {
  update: (req, res) => {
    let preferences = {
      notifydeals: req.body.notifydeals ? true : false,
      notifyproducts: req.body.notifyproducts ? true : false,
      notifyorders: req.body.notifyorders ? true : false,
    };
    req.session.subscription = Object.assign({}, req.session.subscription, {
      preferences: preferences
    });
    res.redirect('/notifications');
  },

  get: (req, res) => {    
    req.session.subscription = Object.assign({}, req.session.subscription, {
      endpoint: req.cookies.endpoint
    });

    console.log(req.session.subscription);

    res.render('notifications', { 
      cart: req.session.cart,
      categories: categories,
      layout: req.query.fragment ? 'fragment' : 'layout',
      scripts: [
        '/js/notifications_main.js'
      ],
      subscription: req.session.subscription,
      title: `PWA Shop: Notifications`,
    });
  }
}

export default notifications;
