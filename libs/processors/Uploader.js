
"use strict";

var logger = require('../log'),
	utils = require('../utils'),
	async = require('async'),
	child_process = require('child_process'),
	Processor = require('../Processor');

	function Uploader(session) {
	  utils.mixin(this, new Processor(session));
}

Uploader.prototype = {
	process: function(callback) {
		var uri;
		var self = this;
		var c = self.getSession();
		var remoteScpTasks = [];

		//do not upload anything in TEST mode
		if (c.test) {
			return callback(null);
		}

		remoteScpTasks = c.remote.map(function(rem) {
			return (function(rem) {
				return function(cb) {
					uri = rem.user + "@" + rem.host + ":" + rem.path;
					logger.trace(c.stub + ":Sending to %s.", uri);
					child_process.exec('rsync -avz --exclude "._" --exclude ".svn" ' + c.buildDir + "/* " + uri, {}, cb);
				};
			})(rem);
		});
		return async.series(remoteScpTasks, callback);
	}
};

module.exports = Uploader;
