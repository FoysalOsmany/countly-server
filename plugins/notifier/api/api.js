'use strict';

const plugin = {};
const moment = require('moment');
const common = require('../../../api/utils/common');
const fetch = require('../../../api/parts/data/fetch');
const sessionCounter = require('./countly.session.counter');
const plugins = require('../../pluginManager');

((plugin => {
  plugins.register("/worker", ob => {
    common.dbUserMap['notifier'] = 'notf';
  });

  plugins.register("/i", ob => {
    console.log('NOTIFIER:I:: ');
  });

})(plugin));

const increaseCounter = (ob) => ob.timestamp && moment().isSame(moment(ob.timestamp), 'd') && sessionCounter.count++;

module.exports = plugin;