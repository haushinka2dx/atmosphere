/* jshint camelcase: false, quotmark: false */
'use strict';
require('./../lib/models/db_spec_helper');
var routes_helper = require('./routes_spec_helper');
var expectjs = require('expect.js');

describe('POST /auth/login', function() {
	it('ログインに成功するとセッションIDを返す', function(done) {
		var data = {user_id: 'test_user_0', password: 'test_password_0'};
		routes_helper.successPost('/auth/login', data)
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('login successful');
			expectjs(body.session_id).to.be.a('string');
			expectjs(body.session_id).to.not.be.empty();
		})
		.end(done);
	});

	it('ログインに失敗すると401を返す', function(done) {
		var data = {'user_id': 'test_user_0', 'password': 'invalid_password'};
		routes_helper.expectSimplePost('/auth/login', data, 401)
		.end(done);
	});
});

describe('GET /auth/logout', function() {
	beforeEach(function(done) {
		var data = {user_id: 'test_user_0', password: 'test_password_0'};
		routes_helper.successPost('/auth/login', data)
		.expect(function(res) {
			expectjs(res.body.session_id).to.not.be.empty();
		})
		.end(done);
	});

	it('ログアウト成功', function(done) {
		routes_helper.successGet('/auth/logout')
		.expect(function(res) {
			expectjs(res.body.status).to.be('ok');
		})
		.end(function() {
			// 認証が必要なルートで弾かれることを確認
			routes_helper.expectGet('/auth/whoami', 401).end(done);
		});
	});
});

describe('GET /auth/whoami', function() {
	it('ログイン中の自分の名前を返す', function(done) {
		routes_helper.successGet('/auth/whoami')
		.expect(function(res) {
			expectjs(res.body.status).to.be('ok');
			expectjs(res.body.user_id).to.be(routes_helper.username);
		})
		.end(done);
	});
});
