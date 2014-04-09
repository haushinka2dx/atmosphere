'use strict';
var _ = require('underscore');

var can = function(v) {
	return !_.isUndefined(v) && !_.isNull(v);
};

exports.can = can;

exports.canl = function(v) {
	return can(v) && (_.isFunction(v) || v.length > 0);
};
