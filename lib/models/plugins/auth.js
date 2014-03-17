/* jshint camelcase: false */
'use strict';
var bcrypt = require('bcrypt');

var encrypt = function(plainText) {
	return bcrypt.hashSync(plainText, bcrypt.genSaltSync(10));
};

module.exports = function(schema) {
	schema.add({
		password: { type: String, required: true },
	});

	schema.method({
		authenticate: function(plainPassword) {
			return bcrypt.compareSync(plainPassword, this.password);
		},
	});

	schema.pre('save', function(next) {
		if(this.isModified('password')) {
			this.password = encrypt(this.password);
		}
		next();
	});
};
