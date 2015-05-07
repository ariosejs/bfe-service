"use strict";

var logger = require('../log'),
	config = require('../config'),
	utils = require('../utils'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	rmdir = require('rmdir'),
	fs = require('fs'),
	Processor = require('../Processor');

function Direr(session) {
	utils.mixin(this, new Processor(session));
	this.made = false;
}

Direr.prototype = {
	
	isMade: function() {
		return this.made;
	},
	process: function(callback) {
		var self = this;
		var str;
		var c = this.getSession();
		var currentTries = config.MKDIR_MAXTRIES;
		if (this.isMade()) {
			callback(null);
		}
		//make
		do {
			if (currentTries-- < 0) {
				str = 'Cannot mkdir a build directory even after ' + config.MKDIR_MAXTRIES+' tries';
				return callback(new Error(str));
			}
			c.buildDir = config.BUILD_DIR + path.sep + Date.now() + "-" + utils.md5(c.seed);
		} while (fs.existsSync(c.buildDir));
		this.made = true;
		return mkdirp(c.buildDir,callback);
	},
	unprocess: function(callback) {
		var c = this.getSession();
		return this.isMade()?rmdir(c.buildDir, function() {
			callback(null);
		}):callback(null);//ignore rmdir failure
	}
};

module.exports = Direr;