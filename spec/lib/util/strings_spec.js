'use strict';
var assert = require('assert');
var cases = require('cases');
var target = require('util/strings');

describe('string2array', function(){
	it('文字列を指定した区切り文字で区切ってトリムした結果を配列で返す', cases([
		['a,b,c,d', ',', ['a','b','c','d']],
		[' a,b , c ,   d     ', ',', ['a','b','c','d']],
		['', ',', []],
		['abc', ',', ['abc']],
		['a:b:c:d', ':', ['a','b','c','d']],
	], function(src, sep, expected){
		assert.deepEqual(target.string2array(src, sep), expected);
	}));
});

describe('endsWith', function(){
	it('指定した文字列で終わっていればtrue', cases([
			['', '', false],
			['a.txt', '.properties', false],
			['aaa.jpg', '.jpg', true],
			['iii/aaa.jpg', '.jpg', true],
			['iii/aaa.jpg', '.png', false],
			['iii/aaa.jpg', 'iii/aaa.jpg', true],
		], function(src, strForSearch, expected){
		assert.deepEqual(target.endsWith(src, strForSearch), expected);
	}));
});

describe('getExtension', function(){
	it('拡張子を取得する', cases([
			['', ''],
			['atxt', ''],
			['.properties', 'properties'],
			['aaa.jpg', 'jpg'],
			['iii.aaa.png', 'png'],
		], function(filename, expected){
		assert.deepEqual(target.getExtension(filename), expected);
	}));
});
