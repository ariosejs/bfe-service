"use strict";

var fs = require('fs'),
	path = require('path'),
	localfs = require('../libs/localfs'),
	config = require('../libs/config'),
	TaskHandler = require('../libs/TaskHandler');

exports.index = function(req, res) {
	return res.render('index', {});
};

exports.list = function(req, res) {
    var tpls = localfs.listFilesSync(config.PROJECTS_DIR, new RegExp("build" + path.sep + ".+" + config.TEMPLATE_EXT + '$'));
    return res.render('list', {
        files: tpls
    });
};

exports.plain = function(req, res) {
	return res.render(req.path.replace(/^\//,''), {});
};

exports.log = function(req, res) {
    var logdir = 'logs/'
    var tabs = [];
    var contents = [];
    return fs.readdir(logdir, function(err, files) {

        files.forEach(function(file) {
            try {
                if (fs.statSync(logdir + file).isFile() && /\blog\b/.test(file)) {
                    tabs.push(file);
                    contents.push(fs.readFileSync(logdir + file, {
                        encoding: 'utf-8'
                    }));
                }
            } catch (e) {
            }
        });
        return res.render('log', {
            tabs: tabs,
            contents: contents
        });
    });
};

exports.publish = function(req, res) {
	var tasks, remote, time, diff;
	try {
		tasks = JSON.parse(req.body.tasks);
	} catch (e) {
		return res.json({
			code: -1,
			msg: '"TASKS" in JSON format should be transfered.'
		});
	}

	try {
		remote = JSON.parse(req.body.remote);
	} catch (e) {
		remote = null; //ignore
		if (req.body.remote) {
			//You're trying to set the remote but get wrong format
			return res.json({
				code: -1,
				msg: '"REMOTE" MUST be in JSON format.'
			});
		}
	}
	console.log(tasks,remote,req.sessionID)
	time = process.hrtime();
    var taskHandler = new TaskHandler({
        stub: req.body.stub,
        remote: remote,
        engine: req.body.engine,
        test: !!req.body.test,
        tpl: req.body.tpl, //this is default template name
        strict: req.body.strict, //strict in integer format
        tasks: tasks, //object(one task) or array(multiple tasks)
        seed: req.sessionID //u know
    });
    var memory = process.memoryUsage();
    return taskHandler.process(function(err) {
        diff = process.hrtime(time);
        return res.json({
            code: err ? -1 : 0,
            session: taskHandler.getSession(),
            result: err ? 'failed' : 'success',
            heap: Number.prototype.toFixed.call(Number(100 * memory.heapUsed / memory.heapTotal), 2) + '%',
            cost: Math.ceil(diff[0] * 1000 + diff[1] / 1e6) + 'ms'
        });
    });

};