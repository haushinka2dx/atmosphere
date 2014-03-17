'use strict';
var assert = require('assert');
var cases = require('cases');
var target = require('util/general');

describe('can', function(){
	it('judge a target is valid or not', cases([
		[undefined, false],
		[null, false],
		[0, true],
		[[], true],
		['', true],
	], function(v, expected) {
		assert.deepEqual(target.can(v), expected);
	}));
});

describe('canl', function(){
	it('judge a target is object has length more than 0 or function',cases([
			[undefined, false],
			[null, false],
			[1, false],
			['', false],
			[[], false],
			[{}, false],
			[' ', true],
			[['a','e'], true],
			[function() { return 1; }, true],
	], function(v, expected){
		assert.deepEqual(target.canl(v), expected);
	}));
});
