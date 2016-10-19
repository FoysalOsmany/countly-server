var plugin = {},
	common = require('../../../api/utils/common.js'),
    plugins = require('../../pluginManager.js');

(function (plugin) {
	//write api call
	plugins.register("/i", function(ob){
		console.log('Observer Write ', ob);
	});

	//read api call
	plugins.register("/o", function(ob){
		console.log('Observer Read ', ob);
	});
}(plugin));

module.exports = plugin;