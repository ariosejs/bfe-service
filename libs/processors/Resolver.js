"use strict";

var logger = require('../log'),
	utils = require('../utils'),
	Processor = require('../Processor');

function Resolver(session) {
	this.resolved = false;
	utils.mixin(this, new Processor(session));
}

Resolver.prototype = {
	process: function(callback) {
		var self = this;
		var c = self.getSession();

		logger.trace(c.stub + ':Starting resolving tasks');

		//Tasks analysis
		c.tasks = c.tasks.filter(function(task, idx) {
			try{
				self._validateTaskSync(task,idx);
				return true;
			}catch(e){
				logger.error(e.message);
				self.addErrorMsg(e.message);
				--c.strict;
				return false;
			}
		});
		if(c.strict<0){
			return callback(new Error('strict overflow'));
		}

		if(!c.tasks.length){
			return callback(new Error('No legal task'));
		}
		this.resolved = true;
		logger.trace(c.stub + ':Resolving tasks done,total:' + c.tasks.length);
		return callback(null);
	},
	_validateTaskSync: function(task, idx) {
		var self = this;
		var str;
		var c = self.getSession();

		task.cmsTarget = task.cmsTarget || task.cmsTpl;
		if ('string' !== typeof task.cmsTarget || !task.cmsTarget) {
			str = 'No target(' + String(task.cmsTarget) + ') defined at task[' + (1 + idx) + '].';
			throw new Error(str);
		}

		task.cmsTpl = task.cmsTpl || c.tpl;
		if (!task.cmsTpl||'string' !== typeof task.cmsTpl ) {
			str = 'No tpl(' + String(task.cmsTpl) + ') defined at task[' + (1 + idx) + '].';
			throw new Error(str);
		}

		task.cmsPayload = task.cmsPayload || {}; //ignore null
		//array is not accepted
		if ('object' !== typeof task.cmsPayload || Array.isArray(task.cmsPayload)) {
			str = 'Payload has to be an object at task[' + (1 + idx) + '].';
			throw new Error(str);
		}

	}
};

module.exports = Resolver;