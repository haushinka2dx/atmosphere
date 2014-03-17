/* jshint camelcase: false */
'use strict';
var _ = require('underscore');

module.exports = function(schema, options) {
	options = options || {};
	if (!_.isFunction(options.transform)) {
		return;
	}

	schema.set('toJSON', {
		transform: options.transform
	});

	schema.set('toObject', {
		transform: options.transform
	});
	
	schema.set('toString', {
		transform: options.transform
	});
};
