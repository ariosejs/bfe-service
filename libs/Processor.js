"use strict";

function Processor(session) {

	//In fact,a session is a configuration object.
	var _mSession = session; //Private core session object

	this.getSession = function() {
	return _mSession;
	};

	this.getErrorMsgs = function() {
		return _mSession.errmsgs;
	};

	this.addErrorMsg = function(err) {
		if (err instanceof Error) {
			_mSession.errmsgs.push(err.message);
		} else if (err && 'string' === typeof err) {
			_mSession.errmsgs.push(err);
		} else if (Array.isArray(err)) {
			_mSession.errmsgs = _mSession.errmsgs.concat(err);
		} else {
			console.error('Unknown error:' + err);
		}
	};
}

Processor.prototype = {
	process: function(callback) {}
};

module.exports = Processor;