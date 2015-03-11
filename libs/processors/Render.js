"use strict";

var fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	template = require('../template'),
	config = require('../config'),
	logger = require('../log'),
	utils = require('../utils'),
	Processor = require('../Processor');

function Render(session) {

	//We calculate this because it's not good for concurrency to render
	//all the tempaltes in SYNC mode.So we handle at most 20 tasks
	//if there're 1000+ tasks.I think that may not be so bad using log(2)(x).
	this.tasksEachStep = ((Math.log(session.tasks.length) / Math.log(2)) | 0 + 1) * 2;

	logger.trace(session.stub + ':We handle ' + this.tasksEachStep + ' tasks each time.');

	this._mHandling = false;
	this.__mStartRenderStamp = 0;
	this.__mPageContentSize = 0;
	
	utils.mixin(this, new Processor(session));
}

Render.prototype = {
	process: function(callback) {
		var self = this;
		var str;
		var c = self.getSession();
		var tasks = c.tasks;

		this.__mStartRenderStamp = process.hrtime(); 

		if (this._mHandling) {
			logger.warn("Duplicated call Render.handle().");
			return callback(new Error("It's already handling."));
		}

		if (!c.engine) {
			logger.trace('using default engine');
			self.engineFunc = template.defaultEngine();
		} else if (!(self.engineFunc = template.getEngine(c.engine))) {
			str = 'Engine named "' + c.engine + '" not found,supported engine:' + template.getSupportedEngineNames().join();
			return callback(new Error(str));
		}

		self._step(callback);

		this._mHandling = true;
		//see number of all the tasks
	},
	/**
	 * Things we need to do in a time segment.
	 * So it has to be an async funciton.
	 * @param  {Function} callback
	 */
	_step: function(callback) {
		var self = this;
		var task;
		var c = self.getSession();
		var st = c.tasks.length > self.tasksEachStep ? (c.tasks.length - self.tasksEachStep) : 0;
		var ed = c.tasks.length > self.tasksEachStep ? c.tasks.length : self.tasksEachStep;
		//Cut out a segment of task array
		var seq = c.tasks.splice(st, ed - st);
		// Each time we render
		for (var i = 0, len = seq.length; i < len; ++i) {
			task = seq[i];
			try {
				self._renderSync(task.cmsTpl, task.cmsTarget, task.cmsPayload);
			} catch (e) {
				if (--c.strict < 0) {
					return callback(e);
				} else {
					//when cache a error,log it here
					self.addErrorMsg(e.message);
					logger.error(e.message);
				}
			}
		}

		if (!c.tasks.length) {
			//Meaning done
			var diff = process.hrtime(this.__mStartRenderStamp);
			c.renderCost = Math.ceil(diff[0] * 1000 + diff[1] / 1e6) + 'ms';
			c.contentSize = this.__mPageContentSize;
			delete c.tasks;
			logger.info(c.stub + ':Render ' + c.contentSize + 'bytes in ' + c.renderCost);
			return callback(null);
		} else {
			return setImmediate(function() {
				self._step(callback);
			});
		}
	},
	/**
	 * [renderSync description]
	 * @param  {String} tpl
	 * @param  {String} target
	 * @param  {Object} data
	 */
	_renderSync: function(tpl, target, data) {
		var c = this.getSession();
		var src = path.join(__dirname,'..','..',config.PROJECTS_DIR,c.stub,'build',config.TEMPLATE_DIR,tpl + config.TEMPLATE_EXT);

		if(!/\.html$/i.test(target)){
			target = target + '.html';
		}

		var dest = path.join(__dirname,'..','..',c.buildDir, target);
		var content = this.engineFunc(src, data);
		var targetBase = path.dirname(dest);

		if (!fs.existsSync(targetBase)) {
			mkdirp.sync(targetBase);
		}
		fs.writeFileSync(dest, content);
		this.__mPageContentSize += content.length;
	}
};

module.exports = Render;
