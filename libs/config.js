"use strict";

var fs = require('fs');

var Configration = {
	TEMPLATE_DIR: './template',
	TEMPLATE_EXT: '.tpl',
	BUILD_DIR: './build',
	JSON_DIR: './json',
	PROJECTS_DIR: './projects', 
	MKDIR_MAXTRIES: 20
};

//We have a default remote setting
try {
	Configration.REMOTE = JSON.parse(fs.readFileSync('remotes.json', {
		encoding: 'utf-8'
	}));
} catch (e) {

}

Object.freeze(Configration);
module.exports = Configration;