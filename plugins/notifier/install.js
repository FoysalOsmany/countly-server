'use strict';

const async = require('async');
const Q = require('q');
const pluginManager = require('../pluginManager.js');
const countlyDb = pluginManager.dbConnection();

console.log("Installing notifier plugin");
countlyDb.collection('apps').find({}).toArray(function (err, apps) {

  if (!apps || err) {
    return;
  }
  function upgrade(app, done) {
    console.log("Creating notifier collection for " + app.name);
    function cb() {
      done();
    }

    Q.ninvoke(countlyDb, 'createCollection', `notifier_daily${app._id}`, cb);
    Q.ninvoke(countlyDb.collection('app_users' + app._id), 'ensureIndex', {"date": 1, "condition": 1}, cb);
  }

  async.forEach(apps, upgrade, function () {
    console.log("Notifier plugin installation finished");
    countlyDb.close();
  });
});