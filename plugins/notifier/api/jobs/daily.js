'use strict';

const moment = require('moment');
const Q = require('q');
const sessionCounter = require('../countly.session.counter');
const platformCounter = require('../countly.platform.counter');
const segmentationCounter = require('../countly.segmentation.counter');
const job = require('../../../../api/parts/jobs/job');
const log = require('../../../../api/utils/log.js')('job:notifier:daily');


class DailyJob extends job.Job {
  run(db, done) {
    const earlierThen7Days = parseInt(moment().subtract(7,'d').unix());
    const getApps = Q.ninvoke(db.collection(`apps`).find({}), 'toArray');
    const getUsersMoreThen10Sessions = (app) =>
      Q.ninvoke(db.collection(`app_users${app._id}`).find({sc: {$gt: 2}}), 'toArray');
    const getUsersNoSessionIn7Days = (app) =>
      Q.ninvoke(db.collection(`app_users${app._id}`).find({ls: {$lt: earlierThen7Days}}), 'toArray');
    const insertNotifierUserData = (app, data, condition) => {
      let users = data.map(u => {
        u.date = new Date();
        u.condition = condition;
        u.userId = u._id;
        delete u._id;

        return u;
      });
      return Q.ninvoke(db.collection(`notifier_daily${app._id}`), 'insert', users);
    };

    const resetSessionAndPlatformCounterTOZero = () => {
      sessionCounter.count = 0;
      platformCounter.count = 0;
      segmentationCounter.count = 0;
    };


    getApps
      .then(apps => apps.map(app =>
        Q.all([
            getUsersMoreThen10Sessions(app),
            getUsersNoSessionIn7Days(app)
          ])
          .spread((u1, u2)  => {
            u1 && insertNotifierUserData(app, u1, 'MORE_THEN_10_SESSION')
              .then(() => console.log(`Users who had more than 10 sessions: ${u1.length})`));
            u2 && insertNotifierUserData(app, u2, 'NO_SESSION_IN_7_DAYS')
              .then(() => console.log(`Users who didn't have a session for more than 7 days: ${u2.length}`));
          })
          .then(done())
      ));

    resetSessionAndPlatformCounterTOZero();
  }
}

module.exports = DailyJob;
