"use strict";

module.exports = {
	md5: function(data) {
		var _encrymd5 = require('crypto').createHash('md5');
		_encrymd5.update(data);
		return _encrymd5.digest('hex');
	},
	mixin: function(thiz, other) {
		if ('object' !== typeof thiz || 'object' !== typeof other) {
			return thiz;
		}
		for (var e in other) {
			if (Object.hasOwnProperty.call(other, e)) {
				thiz[e] = other[e];
			}
		}
		return thiz;
	}
};