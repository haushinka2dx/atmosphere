'use strict';
var _ = require('underscore');
var _s = require('underscore.string');

exports.string2array = function(src, sep) {
	if (_.isString(src) && !_.isEmpty(src)) {
		return src.split(sep).map(function(s) { return s.trim(); });
	}
	else {
		return [];
	}
};

exports.endsWith = function(src, stringForSearch) {
	return !_.isEmpty(src) && !_.isEmpty(stringForSearch) && _s.endsWith(src, stringForSearch);
};

exports.getExtension = function(filename) {
	if (filename.lastIndexOf('.') > -1) {
		return filename.substring(filename.lastIndexOf('.') + 1, filename.length);
	}
	return '';
};
