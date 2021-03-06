"use strict";

var async = require('async'),
	utils = require('./utils'),
	Processor = require('./Processor'),
	Direr = require('./processors/Direr'),
	Validater = require('./processors/Validater'),
	Render = require('./processors/Render'),
	Resolver = require('./processors/Resolver'),
	Uploader = require('./processors/Uploader'),
	logger = require('./log');

function TaskHandler(c) {
	utils.mixin(this, new Processor(c));
}

TaskHandler.prototype = {
	process: function(callback) {
		var self = this;
		var c = self.getSession();

		var validater = new Validater(c);
		var direr = new Direr(c);
		var resolver = new Resolver(c);
		var render = new Render(c);
		var uploader = new Uploader(c);

		var processors = [validater,direr,resolver,render,uploader].map(function(processor){
			return (function(processor){
				return function(cb){
					processor.process(cb);
				};
			})(processor);
		});

		return async.series(processors,function(err){
			return direr.unprocess(function(){
				if(err){
					logger.error(err.message);
					self.addErrorMsg(err.message);
				}
				return callback(err);
			});
		});
		
	}
};

module.exports = TaskHandler;