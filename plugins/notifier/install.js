var async = require('async'),
  pluginManager = require('../pluginManager.js'),
  countlyDb = pluginManager.dbConnection();

console.log("Installing notifier plugin");
countlyDb.collection('apps').find({}).toArray(function (err, apps) {

  if (!apps || err) {
    return;
  }
  function upgrade(app, done){
    var cnt = 0;
    console.log("Creating notifier collection for " + app.name);
    function cb(){
      done();
    }
    countlyDb.command({"convertToCapped": 'notifier' + app._id, size: 1000000, max: 1000}, function(err,data){
      if(err){
        countlyDb.createCollection('notifier' + app._id, {capped: true, size: 1000000, max: 1000}, cb);
      }
      else{
        cb();
      }
    });
  }
  async.forEach(apps, upgrade, function(){
    console.log("Notifier plugin installation finished");
    countlyDb.close();
  });
});