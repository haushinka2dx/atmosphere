/* jshint camelcase: false */
'use strict';

function extract(msg, regexPattern) {
	var results = [];
	var tempMsg = ' ' + msg + ' ';
	var matched;
	while ((matched = regexPattern.exec(tempMsg))) {
		results.push(matched[1]);
	}
	return results;
}

module.exports = function(schema) {
	schema.add({
		message : { type: String, required: true },
		reply_to : { type: String }, // TODO ref: message.id
		hashtags : {type: [String], default: [] },
		responses : {
			fun : {type: [String], default: [] },
			good : {type: [String], default: [] },
			memo : {type: [String], default: [] },
			usefull : {type: [String], default: [] }
		},
	});

	// TODO modelのstaticメソッドにする理由は弱いかも
	schema.static({
		extractAddressesUsers: function(text) {
			return extract(text, /[^@\-_a-zA-Z0-9]@([a-zA-Z0-9\-_]+)/g);
		},

		extractAddressesGroups: function(text) {
			return extract(text, /[^$\-_a-zA-Z0-9]\$([a-zA-Z0-9\-_]+)/g);
		},

		extractHashtags: function(text) {
			return extract(text, /[^#]#([^#@ \n]+)/g);
		}
	});
};
