'use strict';
var assert = require('assert');
var cases = require('cases');
var target = require('util/time_format');

describe('getFormattedTime', function(){
	it('渡された日時を<yyyy/mm/dd hh:mm:ss>形式の文字列にする', cases([
		[new Date(2013, 11, 24, 23, 59, 59), '2013/12/24 23:59:59'],
		[new Date(2013,  1, 24, 23, 59, 59), '2013/02/24 23:59:59'],
		[new Date(2013, 11,  4, 23, 59, 59), '2013/12/04 23:59:59'],
		[new Date(2013, 11, 24,  3, 59, 59), '2013/12/24 03:59:59'],
		[new Date(2013, 11, 24, 23,  9, 59), '2013/12/24 23:09:59'],
		[new Date(2013, 11, 24, 23, 59,  9), '2013/12/24 23:59:09'],
	], function(date, expected){
		assert.equal(target.getFormattedTime(date), expected);
	}));

	it('日付以外が渡された場合は空文字を返す', cases([
		[undefined],
		[null],
		[''],
		[0],
		[[]],
		[{}],
		[function(){}]
		], function(arg){
			assert.equal(target.getFormattedTime(arg), '');
		})
	);
});

describe('getCurrentTime', function(){
	it('現在時刻をgetFormattedTime()形式の文字列にする', function(){
		assert.equal(target.getCurrentTime(), target.getFormattedTime(new Date()));
	});
});
