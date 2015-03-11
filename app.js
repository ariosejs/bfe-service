"use strict";
var express = require('express'),
	cluster = require('cluster'),
	routes = require('./routes'),
	// routesLocal = require('./routes/local'),
	child_process = require('child_process'),
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	rmdir = require('rmdir'),
	swig = require('swig'),
	// config = require('./libs/config'),
	logger = require('./libs/log');

var cpuCount = require('os').cpus().length;

process.on('uncaughtException', function(err) {
	logger.error('Uncaught exception: ' + err);
});
if (cluster.isMaster) {
	for (var i = 0; i < cpuCount; i += 1) {
		cluster.fork();
	}
	// rmdir('build/*',function(){});
}else{
	var app = express();
	var devMode = true || ('development' === app.get('env'));

	app.set('port', process.env.PORT || 8000);
	app.engine('tpl', swig.renderFile);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'tpl');
	// app.use(express.favicon(__dirname + "/public/images/favicon.ico"));
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded({
		limit: '50mb'
	}));
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: "chunbo.com"
	}));

	app.use(app.router);
	
	//support:$node app.js local demo
	var params = process.argv.slice(2);
	if ('local' === params[0] && params[1]) {
		console.log('You are running at LOCAL mode.');
		app.use(express.static(path.join(__dirname, config.PROJECTS_DIR, params[1])));
		// app.get(/\.do$/, new routesLocal(params[1]).calldo);
	} else {
		app.use(express.static(path.join(__dirname, 'public')));
	}

	// development only
	if (devMode) {
		app.set('view cache', false);
		app.use(express.errorHandler());
		swig.setDefaults({
			cache: false
		});
	}

	app.get('/', routes.index); //output templates list
	// app.get(/^\/list/, routes.list);
	app.get(/^\/(spec|guide|index)/, routes.plain);
	app.post(/^\/publish/, routes.publish); //core publish function
	// app.get(/^\/log$/, routes.log);


	http.createServer(app).listen(app.get('port'), function() {
		console.log('BFE Service server listening on port ' + app.get('port'));
	});
}
