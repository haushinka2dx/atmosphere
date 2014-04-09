/* jshint camelcase: false, quotmark: false */
'use strict';
require('./../lib/models/db_spec_helper');
var routes_helper = require('./routes_spec_helper');
var expectjs = require('expect.js');

describe('GET', function() {
});

describe('POST', function() {
	describe('/private/cancel', function() {
		it('未実装', function(done) {
			routes_helper.successPost('/private/cancel')
			.expect(function(res) {
				expectjs(res.body.status).to.be('not implements');
			})
			.end(done);
		});
	});
});
