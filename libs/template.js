"use strict";

var swig = require('swig'),
	fs = require('fs'),
	Mustache = require('mustache');

var engineName = "swig|twig|jinja|jinja2|mustache";

//path=>func
var twigCache = {};

//path=>source
var mustacheCache = {};

//Engines collection
var engines = [{
	is: function(name) {
		return 'string' === typeof name && /^(?:s|t)wig|jinja2?$/i.test(name);
	},
	func: function(tpl, data) {
		var func;

		//Here we cache the compiled function
		//The cache of swig itself is not trusted
		if (!(func = twigCache[tpl])) {
			func = swig.compileFile(tpl);
			//we cache when not developing
			if(process.env.NODE_ENV !== 'development')
				twigCache[tpl] = func;
		}
		return func(data);
	}
}, {
	is: function(name) {
		return 'mustache' === String.prototype.toLowerCase.call(name);
	},
	func: function(tpl, data) {
		var source;

		//Here we can not cache the source.
		if (!(source = mustacheCache[tpl])) {
			source = fs.readFileSync(tpl, {
				encoding: 'utf-8'
			});

			//we cache when not developing
			if(process.env.NODE_ENV !== 'development')
				mustacheCache[tpl] = source;
		}
		return Mustache.to_html(source, data);
	}
}];

module.exports = {
	/**
	* Get an engine by approximate name matching.
	* @param  {String} name
	* @return {Function}   The render function of the engine,or null if no engine found.
	*/
	getEngine: function(name) {
		for (var i = engines.length - 1; i >= 0; i--) {
			if (engines[i].is(name)) {
				return engines[i].func;
			}
		}
		return null;
	},
	/**
	* Get the default engine.
	* @return {Function}
	*/
	defaultEngine: function() {
		return engines[0].func || null;
	},
	getSupportedEngineNames: function() {
		return engineName.split('|');
	}
};