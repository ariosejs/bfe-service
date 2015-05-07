"use strict";

var config = require('../libs/config'),
	fs = require('fs'),
	path = require('path'),
	config = require('../libs/config'),
	template = require('../libs/template');

var engineFunc = template.defaultEngine();

module.exports = function(stub){

	/**
	 * Handle *.do request.
	 * @param  {Request} req
	 * @param  {Response} res
	 */
	this.calldo = function(req, res) {
		var tpl = path.join(config.PROJECTS_DIR,stub,config.TEMPLATE_DIR, req.path.replace(/\.do$/i, config.TEMPLATE_EXT));
		var jsonPath = path.join(config.PROJECTS_DIR,stub,config.JSON_DIR, req.path.replace(/\.do/i,'.json'));
		var data={};
		try{
			data = JSON.parse(fs.readFileSync(jsonPath,{encoding:'utf-8'}));
		}catch(e){
			console.warn(e);
		}
		try {
			//Pass an absolute path
			return res.send(engineFunc(__dirname + path.sep + ".." + path.sep + tpl, data));
		} catch (e) { 
			return res.send(e.message);
		}
	};
};