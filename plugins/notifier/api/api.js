'use strict';

const plugin = {};
const moment = require('moment');
const common = require('../../../api/utils/common');
const fetch = require('../../../api/parts/data/fetch');
const sessionCounter = require('./countly.session.counter');
const platformCounter = require('./countly.platform.counter');
const segmentationCounter = require('./countly.segmentation.counter');
const plugins = require('../../pluginManager');

(plugin => {
  let sessionMilestone = sessionCounter.count;

  const increaseSessionCounter = (ob) => {
    let timestamp = ob.params.qstring.timestamp;

    moment.unix(timestamp).diff(moment(), 'days') == 1
    && sessionCounter.count++;

    sessionCounter.count % 100 === 0
    && sessionCounter.count > sessionMilestone
    && (sessionMilestone = sessionCounter.count)
    && console.log(`Total session count reached ${Math.round(sessionCounter.count / 100)}0 for today`);
  };

  const convertQueryStringToObject = (qString) => JSON.parse(
    '{"' + decodeURI(qString).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}'
  );

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
    ob.params.qstring
    && ob.params.qstring.metrics
    && moment.unix(ob.params.qstring.timestamp).diff(moment(), 'days') == 1
    && ob.params.qstring.metrics._os === 'iOS'
    && console.log(`${++platformCounter.count} Session occured with user property "Platform" = "iOS"`)
  });

  plugins.register("/i/events", ob => {
    console.log(ob.currEvent);
    moment.unix(ob.params.qstring.timestamp).diff(moment(), 'days') == 1
    && ob.currEvent.segmentation
    && ob.currEvent.segmentation.level >= 2
    && segmentationCounter.count++;

    ob.currEvent
    && ob.currEvent.segmentation
    && ob.currEvent.segmentation.Character === 'John'
    && segmentationCounter.count % 10 === 0
    && console.log(`"Play" custom event sum with segmentation
    "Character" = "John" reached ${Math.round(segmentationCounter.count / 10)}0 for today`);
  });
})(plugin);

module.exports = plugin;