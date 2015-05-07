"use strict";

var path = require('path'),
	fs = require('fs'),
	logger = require('../log'),
	utils = require('../utils'),
	config = require('../config'),
	Processor = require('../Processor');

function Validater(session) {
	utils.mixin(this, new Processor(session));
	//errmsgs MUST be the last,because we loop from the last to the first
	this.mValidatingKeys = 'strict,seed,remote,tasks,tpl,engine,stub,errmsgs'.split(',');
}

Validater.prototype = {
	process: function(callback) {
		var i, func, funcName;
		var c = this.getSession();

		var upper = function(k) {
			return k.toUpperCase();
		};
		for (i = this.mValidatingKeys.length - 1; i >= 0; i--) {
			funcName = "_validate" + this.mValidatingKeys[i].replace(/^\w/, upper);
			func = this[funcName];
			try {
				func.call(this, c);
			} catch (e) {
				return callback(e);
			}
		}

		//All passed.
		callback();
	},
	_validateStub: function(c) {
		var dir, stat;
		if (!c.stub || 'string' !== typeof c.stub || !/^[\w-]+$/.test(c.stub)) {
			throw new Error('"stub"(' + c.stub + ') MUST be set as a string contains only a-zA-Z_0-9 chars');
		}
		dir = path.join(config.PROJECTS_DIR, c.stub);
		if (!fs.existsSync(dir)) {
			throw new Error('"stub"(' + c.stub + ') does not exist');
		}
		stat = fs.statSync(dir);
		if (!stat.isDirectory()) {
			throw new Error('"stub"(' + c.stub + ') is not a directory');
		}
		return c.stub;
	},
	_validateStrict: function(c) {
		if (undefined === c.strict) {
			c.strict = 0;
		}
		c.strict = +c.strict;
		if (Number.isNaN(c.strict) || c.strict < 0 || !isFinite(c.strict) || Math.ceil(c.strict) !== c.strict) {
			throw new Error('"strict"(' + c.strict + ') has to be a non-negative integer.');
		}
		return c.strict;
	},
	_validateSeed: function(c) {
		if (!c.seed) {
			c.seed = String((Math.random() * 1e+6) | 0);
		} else if ('string' !== typeof c.seed && 'number' !== typeof c.seed) {
			throw new Error('"seed" has to be a string or a number');
		}
		c.seed = String(c.seed);
		return c.seed;
	},
	_validateRemote: function(c) {
		var self = this;
		var remote = c.remote || [];

		var str;

		var names = "path,host".split(',');

		if (!Array.isArray(remote)) {
		    remote = [remote]; //make it an array if it's an object
		}
		remote.forEach(function(rem, index) {
			rem.user = String(rem.user || "root");
			names.forEach(function(name) {
				if (!rem[name] || 'string' !== typeof rem[name]) {
					str = 'Illegal ' + name + ' at remote[' + (1 + index) + ']';
					throw new Error(str);
				}
			});
		});

		//default remote
		if (!remote.length) {
			if (!Array.isArray(config.REMOTE)||!config.REMOTE.length) {
				throw new Error('No default remote defined.');
			} else {
				remote = config.REMOTE;
			}
		}

		c.remote = remote;
		return c.remote;
	},
	_validateTasks: function(c) {
		if (c.tasks && 'object' === typeof c.tasks && !Array.isArray(c.tasks)) {
			//plain object
			c.tasks = [c.tasks];
		}

		if (!Array.isArray(c.tasks) || !c.tasks.length) {
			throw new Error('"tasks" should be a non-empty array.');
		}
		return c.tasks;
	},
	_validateTpl: function(c) {
		if (c.tpl && 'string' !== typeof c.tpl) {
			throw new Error('"tpl" should be null or a string.');
		}
		return c.tpl;
	},
	_validateErrmsgs: function(c) {
		if (!c.errmsgs || !Array.isArray(c.errmsgs)) {
			c.errmsgs = [];
		}
		return c.errmsgs;
	},
	_validateEngine: function(c) {
		if (c.engine && 'string' !== typeof c.engine) {
			throw new Error('"engine" has to be a non-empty string or null.');
		}
		return c.engine;
	}
};

module.exports = Validater;