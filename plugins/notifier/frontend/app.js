'use strict';

const Q = require('q');
const config = require('../../../api/config');
let plugin = {};
const countlyConfig = require('../../../frontend/express/config');

((plugin) => {
  plugin.init = (app, db) => {
    app.get(countlyConfig.path + '/notifications/daily', function (req, res, next) {
      Q.all([
          Q.ninvoke(db.collection(`notifier_daily${req.query.app_id}`).find({condition: 'NO_SESSION_IN_7_DAYS'}), 'count'),
          Q.ninvoke(db.collection(`notifier_daily${req.query.app_id}`).find({condition: 'MORE_THEN_10_SESSION'}), 'count'),
          Q.ninvoke(db.collection(`notifier_daily${req.query.app_id}`).find({ $query: {}, $orderby: { ls : -1 }}).limit(100), 'toArray')
        ])
        .spread((c1, c2, users) => {
          res.send({
            path: countlyConfig.path || "",
            cdn: countlyConfig.cdn || "",
            users: users,
            noSessionIn7Days: c1,
            moreThen10Session: c2
          })
        })
        .catch(e => next(e));
    });
  };
})(plugin);

module.exports = plugin;
