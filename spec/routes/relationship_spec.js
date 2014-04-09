/* jshint camelcase: false, quotmark: false */
'use strict';
require('./../lib/models/db_spec_helper');
var routes_helper = require('./routes_spec_helper');
var expectjs = require('expect.js');

describe('GET', function() {
	describe('/relationship/status', function() {
		it('未実装', function(done) {
			routes_helper.successGet('/relationship/status')
			.expect(function(res) {
				expectjs(res.body.status).to.be('not implements');
			})
			.end(done);
		});
	});

	describe('/relationship/speakers', function() {
		// TODO ちょっと何言っているか分からない
		it('指定ユーザーがlistenしている一覧を取得する', function(done) {
			routes_helper.successGet('/relationship/speakers?target_user_id=test_user_1')
			.expect(function(res) {
				// TODO
				expectjs(res.body).to.have.length(0);
			})
			.end(done);
		});

		it('ユーザー指定がなければ自分を対象とする', function(done) {
			routes_helper.successGet('/relationship/speakers')
			.expect(function(res) {
				// TODO
				expectjs(res.body).to.have.length(0);
			})
			.end(done);
		});
	});

	describe('/relationship/listeners', function() {
		// TODO ちょっと何言っているか分からない
		it('指定ユーザーをlistenしている一覧を取得する', function(done) {
			routes_helper.successGet('/relationship/listeners?target_user_id=test_user_1')
			.expect(function(res) {
				// TODO
				expectjs(res.body).to.have.length(0);
			})
			.end(done);
		});

		it('ユーザー指定がなければ自分を対象とする', function(done) {
			routes_helper.successGet('/relationship/listeners')
			.expect(function(res) {
				// TODO
				expectjs(res.body).to.have.length(0);
			})
			.end(done);
		});
	});
});

describe('POST', function() {
	describe('/relationship/listen', function() {
		it('未実装', function(done) {
			routes_helper.successPost('/relationship/listen')
			.expect(function(res) {
				expectjs(res.body.status).to.be('not implements');
			})
			.end(done);
		});
	});
});
