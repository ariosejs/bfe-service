"use strict";

var fs = require('fs'),
	path = require('path'),
	util = require('util');


var LocalFS = module.exports = {

	listFilesSync: function(dir, reg) {
	var ret = [],
		files,fullfile,stat;
	try {
		files = fs.readdirSync(dir);
		files.forEach(function(file, idx) {
			fullfile = path.join(dir, file);
			stat = fs.lstatSync(fullfile);
			if (stat.isFile()) {
				if (!reg || (util.isRegExp(reg) && reg.test(fullfile))) {
					ret.push(fullfile);
				}
			} else if (stat.isDirectory()) {
				ret = ret.concat(LocalFS.listFilesSync(fullfile, reg));
			}
		});
	} catch (e) {}

	return ret;
	}
};