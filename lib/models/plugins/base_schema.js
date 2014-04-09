/* jshint camelcase: false */
'use strict';
var moment = require('moment');

function dateFormat(value) {
	return moment.utc(value).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
}

module.exports = function(schema) {
	schema.add({
		created_by: { type: String, required: true },
		created_at: { type: String, required: true, default: function() { return moment.utc(); } },
	});

	schema.path('created_at').get(function(value) {
		return dateFormat(value);
	});

	schema.pre('save', function(next) {
		this.created_at = dateFormat(this.created_at);
		next();
	});
};
