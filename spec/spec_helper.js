'use strict';
// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';

var expect = require('expect.js');

exports.expectNoError = function(done) {
	return function(err) {
		if (err) {
			console.log('');
			console.log('**** Full exception ****');
			console.log(err);
			console.log('************************');
			// TODO ここでexpect()呼んでもコンテキストが違うからメッセージがあれ
			// Uncaught TypeError: Object explicit failure has no method 'call'
			expect().fail();
		}
		done();
	};
};
