/* jshint camelcase: false */
'use strict';
//require('../models/../lib/models/db_spec_helper');
var request = require('supertest');
var app = require('../../app');
var User = require('models/user');
var agent;

var users = [];
for (var i=0; i < 4; i++) {
	var user = new User({
		username: 'test_user_' + i,
		password: 'test_password_' + i,
		created_by: 'test',
	});
	users.push(user);
}

beforeEach(function(done) {
	agent = request.agent(); // refresh
	User.create(users, function() {
		request(app)
		.post('/auth/login')
		.field('user_id', 'test_user_0')
		.field('password', 'test_password_0')
		.expect(200)
		.end(function(err, res) {
			if(err) {
				throw err;
			}
			agent.saveCookies(res);
			done();
		});
	});
});

var expectSimpleGet = function(url, code) {
	var req = request(app)
		.get(url)
		.expect(code);
	agent.attachCookies(req);
	return req;
};

var expectGet = function(url, code) {
	return expectSimpleGet(url, code)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect('Access-Control-Allow-Origin', '*');
};

exports.username = 'test_user_0';

exports.auth = function(req) {
	agent.attachCookies(req);
};

exports.expectGet = expectGet;
exports.successGet = function(url) {
	return expectGet(url, 200);
};

var expectSimplePost = function(url, data, code) {
	var req = request(app).post(url);
	agent.attachCookies(req); // post(url)の後、send()の前に書く
	req.send(data)
	.expect(code);
	return req;
};

var expectPost = function(url, data, code) {
	return expectSimplePost(url, data, code)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect('Access-Control-Allow-Origin', '*');
};

exports.expectSimplePost = expectSimplePost;
exports.expectPost = expectPost;
exports.successPost = function(url, data) {
	return expectPost(url, data, 200);
};

