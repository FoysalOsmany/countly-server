'use strict';

const plugin = {};
const moment = require('moment');
const common = require('../../../api/utils/common');
const fetch = require('../../../api/parts/data/fetch');
const sessionCounter = require('./countly.session.counter');
const platformCounter = require('./countly.platform.counter');
const segmentationCounter = require('./countly.segmentation.counter');
const plugins = require('../../pluginManager');
const mail = require("../../../api/parts/mgmt/mail");

plugins.setConfigs("notifier", {
  send_email: true,
  recipients: ''
});

(plugin => {
  let sessionMilestone = sessionCounter.count;

  const notify = (msg) => {
    console.log(msg);
    (plugins.getConfig('notifier').send_email && mail.sendMessage(
      plugins.getConfig('notifier').recipients,
      'Count.ly Notification',
      msg
    ));
  };

  const increaseSessionCounter = (ob) => {
    let timestamp = ob.params.qstring.timestamp;

    moment.unix(timestamp).diff(moment(), 'days') == 1
    && sessionCounter.count++;

    const msg = `Total session count reached ${Math.round(sessionCounter.count / 100)}0 for today`;

    sessionCounter.count % 100 === 0
    && sessionCounter.count > sessionMilestone
    && (sessionMilestone = sessionCounter.count)
    && notify(msg);
  };

  plugins.register("/worker", ob => {
    common.dbUserMap['notifier'] = 'notf';
  });

  plugins.register("/session/begin", ob => {
    increaseSessionCounter(ob);
  });

  plugins.register("/session/extend", ob => {
    increaseSessionCounter(ob);
  });

  plugins.register("/i", ob => {
    const msg = `${++platformCounter.count} Session occured with user property "Platform" = "iOS"`;
    ob.params.qstring
    && ob.params.qstring.metrics
    && moment.unix(ob.params.qstring.timestamp).diff(moment(), 'days') == 1
    && ob.params.qstring.metrics._os === 'iOS'
    && notify(msg);
  });

  plugins.register("/i/events", ob => {
    const msg = `"Play" custom event sum with segmentation
    "Character" = "John" reached ${Math.round(segmentationCounter.count / 10)}0 for today`;
    moment.unix(ob.params.qstring.timestamp).diff(moment(), 'days') == 1
    && ob.currEvent.segmentation
    && ob.currEvent.segmentation.level >= 2
    && segmentationCounter.count++;

    ob.currEvent
    && ob.currEvent.segmentation
    && ob.currEvent.segmentation.Character === 'John'
    && segmentationCounter.count % 10 === 0
    && notify(msg);
  });
})(plugin);

module.exports = plugin;