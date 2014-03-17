'use strict';
// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var config = require('config');

function clearDB(done) {
	var nothing = function() {};
	for (var i in mongoose.connection.collections) {
		mongoose.connection.collections[i].remove(nothing);
	}
	return done();
}

beforeEach(function(done) {
	if (mongoose.connection.readyState === 0) {
		mongoose.connect(config.db.url, function(err) {
			if (err) {
				throw err;
			}
			return clearDB(done);
		});
	} else {
		return clearDB(done);
	}
});

afterEach(function(done) {
	//mongoose.disconnect();
	done();
});
