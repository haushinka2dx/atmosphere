/* jshint camelcase: false, quotmark: false */
'use strict';
require('./../lib/models/db_spec_helper');
var routes_helper = require('./routes_spec_helper');
var expectjs = require('expect.js');

describe('GET /user/list', function(){
	it('条件指定がなければ全ユーザーの一覧を返す', function(done){
		routes_helper.successGet('/user/list')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(4);
			expectjs(body.head_user_id).to.be('test_user_0');
			expectjs(body.tail_user_id).to.be('test_user_3');
			for (var i=0; i < 4; i++) {
				expectjs(body.results[i].user_id).to.be('test_user_' + i);
			}
		})
		.end(done);
	});

	it('ユーザーの不必要な情報は見えないようになっている', function(done){
		routes_helper.successGet('/user/list')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.results[0].password).to.be(undefined);
		})
		.end(done);
	});

	it('取得件数を指定できる', function(done){
		routes_helper.successGet('/user/list?count=2')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(2);
			expectjs(body.head_user_id).to.be('test_user_0');
			expectjs(body.tail_user_id).to.be('test_user_1');
			for (var i=0; i < 2; i++) {
				expectjs(body.results[i].user_id).to.be('test_user_' + i);
			}
		})
		.end(done);
	});

	// 厳密には「指定文字の先頭文字のアルファベットによる比較」
	it('指定したユーザーより前の一覧を取得できる', function(done){
		routes_helper.successGet('/user/list?before_user_id=test_user_3')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(3);
			expectjs(body.head_user_id).to.be('test_user_0');
			expectjs(body.tail_user_id).to.be('test_user_2');
			for (var i=0; i < 3; i++) {
				expectjs(body.results[i].user_id).to.be('test_user_' + i);
			}
		})
		.end(done);
	});

	// 厳密には「指定文字の先頭文字のアルファベットによる比較」
	it('指定したユーザーより後の一覧を取得できる', function(done){
		routes_helper.successGet('/user/list?after_user_id=test_user_1')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(2);
			expectjs(body.head_user_id).to.be('test_user_2');
			expectjs(body.tail_user_id).to.be('test_user_3');
			expectjs(body.results[0].user_id).to.be('test_user_2');
			expectjs(body.results[1].user_id).to.be('test_user_3');
		})
		.end(done);
	});

	it('存在しないユーザー名を指定した場合は空を返す(before_user_id)', function(done){
		routes_helper.successGet('/user/list?before_user_id=a')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(0);
			expectjs(body.head_user_id).to.be('');
			expectjs(body.tail_user_id).to.be('');
			expectjs(body.results).to.be.empty();
		})
		.end(done);
	});

	it('存在しないユーザー名を指定した場合は空を返す(after_user_id)', function(done){
		routes_helper.successGet('/user/list?after_user_id=z')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(0);
			expectjs(body.head_user_id).to.be('');
			expectjs(body.tail_user_id).to.be('');
			expectjs(body.results).to.be.empty();
		})
		.end(done);
	});

	it('条件を組み合わせることができる', function(done){
		routes_helper.successGet('/user/list?after_user_id=test_user_1&count=1')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(1);
			expectjs(body.head_user_id).to.be('test_user_2');
			expectjs(body.tail_user_id).to.be('test_user_2');
			expectjs(body.results[0].user_id).to.be('test_user_2');
		})
		.end(done);
	});

	it.skip('エラー時', function(done){
		done();
	});

	it.skip('where指定(paramNameSearchCondition)', function(done){
		done();
	});
});

describe('GET /user/show', function(){
	it('指定されたユーザー情報を返す', function(done){
		routes_helper.successGet('/user/show?user_id=test_user_0')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.user_id).to.be('test_user_0');
			expectjs(body.introduction).to.be.a('string');
			expectjs(body.avator).to.be.a('string');
			expectjs(body.groups).to.be.an('array');
			expectjs(body.relationship).to.be.an('object');
		})
		.end(done);
	});

	it('ユーザー名が指定されていなければ400を返す', function(done){
		routes_helper.expectGet('/user/show', 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'user_id' is must be assigned.");
		})
		.end(done);
	});

	it('ユーザーが存在しなければ404を返す', function(done){
		routes_helper.expectGet('/user/show?user_id=tom', 404)
		.expect(function(res) {
			expectjs(res.body).to.be('user was not found: tom');
		})
		.end(done);
	});

	it('ユーザーの不必要な情報は見えないようになっている', function(done){
		routes_helper.successGet('/user/show?user_id=test_user_0')
		.expect(function(res) {
			expectjs(res.body.password).to.be(undefined);
		})
		.end(done);
	});
});

describe('GET /user/avator', function(){
	it.skip('指定されたユーザーのアバターデータをバイナリで返す', function(done){
		done();
	});

	it('ユーザー名が指定されていなければ400を返す', function(done){
		routes_helper.expectGet('/user/avator', 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'user_id' is must be assigned.");
		})
		.end(done);
	});

	it('ユーザーが存在しなければ404を返す', function(done){
		routes_helper.expectGet('/user/avator?user_id=tom', 404)
		.expect(function(res) {
			expectjs(res.body).to.be('user was not found: tom');
		})
		.end(done);
	});
});

describe('POST /user/register', function(){
	// TODO 他のところもこんな感じに汎用化する？
	function expect400(data, done) {
		routes_helper.expectPost('/user/register', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'new_user_id' and 'new_user_password' are must be assigned.");
		})
		.end(done);
	}

	it('ユーザー名がなければ400を返す(キーなし)', function(done){
		expect400({new_user_password: 'password'}, done);
	});

	it('ユーザー名がなければ400を返す(値が空)', function(done){
		expect400({new_user_id: '', new_user_password: 'password'}, done);
	});

	it('パスワードがなければ400を返す(キーなし)', function(done){
		expect400({new_user_id: '', new_user_password: 'password'}, done);
	});

	it('パスワードがなければ400を返す(値が空)', function(done){
		expect400({new_user_id: 'Taro', new_user_password: ''}, done);
	});

	it('ユーザー登録が出来る', function(done){
		var data = {new_user_id: 'Taro', new_user_password: 'taropass'};
		routes_helper.successPost('/user/register', data)
		.expect(function(res) {
			expectjs(res.body.status).to.be('ok');
		})
		.end(done);
	});
});

describe.skip('POST /user/destroy', function(){
	it.skip('ユーザー削除が出来る', function(done){
		done();
	});
});

describe('POST /user/change_password', function(){
	it('現在のパスワードがなければ400を返す(キーなし)', function(done){
		var data = {new_user_password: 'pass'};
		routes_helper.expectPost('/user/change_password', data, 400)
		.expect(function(res) {
			expectjs(res.body)
			.to.be("'current_user_password' and 'new_user_password' are must be assigned.");
		})
		.end(done);
	});

	it('現在のパスワードがなければ400を返す(値が空)', function(done){
		var data = {current_user_password: '', new_user_password: 'pass'};
		routes_helper.expectPost('/user/change_password', data, 400)
		.expect(function(res) {
			expectjs(res.body)
			.to.be("'current_user_password' and 'new_user_password' are must be assigned.");
		})
		.end(done);
	});

	it('新しいパスワードがなければ400を返す(キーなし)', function(done){
		var data = {current_user_password: 'pass'};
		routes_helper.expectPost('/user/change_password', data, 400)
		.expect(function(res) {
			expectjs(res.body)
			.to.be("'current_user_password' and 'new_user_password' are must be assigned.");
		})
		.end(done);
	});

	it('新しいパスワードがなければ400を返す(値が空)', function(done){
		var data = {current_user_password: 'pass', new_user_password: ''};
		routes_helper.expectPost('/user/change_password', data, 400)
		.expect(function(res) {
			expectjs(res.body)
			.to.be("'current_user_password' and 'new_user_password' are must be assigned.");
		})
		.end(done);
	});

	it('現在のパスワードが異なれば400を返す', function(done){
		var data = {current_user_password: 'invalid_password', new_user_password: 'new_password'};
		routes_helper.expectPost('/user/change_password', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("There is no user or password does not match.");
		})
		.end(done);
	});

	it('自分のパスワードを変更できる', function(done){
		var data = {current_user_password: 'test_password_0', new_user_password: 'new_password'};
		routes_helper.successPost('/user/change_password', data)
		.expect(function(res) {
			expectjs(res.body.status).to.be('ok');
		})
		.end(done);
	});
});

describe('POST /user/change_profile', function(){
	it('新しい紹介文がなければ400を返す(キーなし)', function(done){
		var data = {};
		routes_helper.expectPost('/user/change_profile', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'new_introduction' is must be assigned.");
		})
		.end(done);
	});

	it('新しい紹介文が空文字でも変更できる', function(done){
		var data = {new_introduction: ''};
		routes_helper.successPost('/user/change_profile', data)
		.expect(function(res) {
			expectjs(res.body.status).to.be('ok');
		})
		.end(done);
	});

	it('自分の紹介文を変更できる', function(done){
		var data = {new_introduction: 'modified'};
		routes_helper.successPost('/user/change_profile', data)
		.expect(function(res) {
			expectjs(res.body.status).to.be('ok');
		})
		.end(done);
	});
});

describe.skip('POST /user/change_avator', function(){
	it.skip('', function(done){
		done();
	});
});
