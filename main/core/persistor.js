var vertx = require('vertx');
var eventBus = require('vertx/event_bus');
load('main/util/atmos_debug.js');
load('main/core/constants.js');

var Persistor = function() {
};
Persistor.prototype = {
	pa : getConstants().persistorAddress,

	eb : function() {
		var eb = vertx.eventBus;
		return eb;
	},

	pk : "_id",
	numOfResult : "number",
	createdAt : "created_at",
	createdBy : "created_by",
	userId : "username",

	condLessThan : "$lt",
	condGreaterThan : "$gt",
	condIn : "$in",

	createReplyHandler : function(processor) {
		var resultProcessor = processor;
		return function(reply, replier) {
			resultProcessor(reply);
			if (reply.status === 'more-exist') {
				replier({}, Persistor.prototype.createReplyHandler(resultProcessor));
			}
		}
	},

	find : function(callback, collName, where, rangeCondition, sort, limit) {
		if (typeof(rangeCondition) != 'undefined' && rangeCondition != null) {
			var rangeConditionJSON = rangeCondition.toJSON();
			if (Object.keys(rangeConditionJSON).length > 0) {
				where[rangeCondition.columnName] = rangeConditionJSON;
			}
		}

		var ebMsg = {};
		ebMsg['action'] = "find";
		ebMsg['collection'] = collName;
		if (typeof(where) != 'undefined' && where != null) {
			ebMsg['matcher'] = where;
		}
		if (typeof(sort) != 'undefined' && sort != null) {
			ebMsg['sort'] = sort;
		}
	 	if (limit > 0) {
			ebMsg['limit'] = limit;
		}
		atmos.log("find msg: " + JSON.stringify(ebMsg));

		var processor = (function(){
			var finalCallback = callback;
			var results = [];
			return function(res) {
				if (res.status !== 'error') {
					for (var i=0; i<res.results.length; i++) {
						results.push(res.results[i]);
					}
					if (res.status !== 'more-exist') {
						var result = {
							status : 'ok',
							number : results.length,
							results : results
						};
						callback(result);
					}
				}
				else {
					callback(res);
				}
			}
		})();

		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			ebMsg,
			Persistor.prototype.createReplyHandler(processor)
		);
	},

	findOne : function(callback, collName, _id) {
		var where = {};
		where[Persistor.prototype.pk] = _id;

		var ebMsg = {};
		ebMsg['action'] = "find";
		ebMsg['collection'] = collName;
		ebMsg['matcher'] = where;
		ebMsg['limit'] = 1;
		atmos.log("find msg: " + JSON.stringify(ebMsg));

		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			ebMsg,
			callback
		);
	},

	findIn : function(callback, collName, where, inCondition, sort, limit) {
		var w = {};
		if (typeof(where) != 'undefined' && where != null && Object.keys(where).length > 0) {
			w = where;
		}
		var inConditionJSON = inCondition.toJSON();
		if (Object.keys(inConditionJSON).length > 0) {
			for (var k in inConditionJSON) {
				w[k] = inConditionJSON[k];
			}
		}

		var ebMsg = {};
		ebMsg['action'] = "find";
		ebMsg['collection'] = collName;
		if (Object.keys(w).length > 0) {
			ebMsg['matcher'] = w;
		}
		if (typeof(sort) != 'undefined' && sort != null) {
			ebMsg['sort'] = sort;
		}
	 	if (limit > 0) {
			ebMsg['limit'] = limit;
		}
		atmos.log("find msg: " + JSON.stringify(ebMsg));

		var processor = (function(){
			var finalCallback = callback;
			var results = [];
			return function(res) {
				if (res.status !== 'error') {
					for (var i=0; i<res.results.length; i++) {
						results.push(res.results[i]);
					}
					if (res.status !== 'more-exist') {
						var result = {
							status : 'ok',
							number : results.length,
							results : results
						};
						callback(result);
					}
				}
				else {
					callback(res);
				}
			}
		})();

		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			ebMsg,
			Persistor.prototype.createReplyHandler(processor)
		);
	},

	insert : function(callback, collName, document, userId, createdAt) {
		if (typeof(createdAt) === 'undefined' || createdAt == null) {
			createdAt = new Date();
		}
		document[Persistor.prototype.createdBy] = userId;
		document[Persistor.prototype.createdAt] = createdAt;
		Persistor.prototype.eb().send(Persistor.prototype.pa, {
			"action" : "save",
			"collection" : collName,
			"document" : document
		}, callback);
	},

	// / update document which has assigned "_id"
	// / ex.
	// / id: hosgeiljsaese38833 // String
	// / document: whole data after updated // JSON
	update : function(callback, collName, id, document) {
		var criteria = {};
		criteria[Persistor.prototype.pk] = id;
		Persistor.prototype.eb().send(Persistor.prototype.pa, {
			"action" : "update",
			"collection" : collName,
			"criteria" : criteria,
			"objNew" : document,
			"upsert" : false,
			"multi" : false
		}, callback);
	},

	// / update documents which is mathed for criteria.
	// / ex.
	// / criteria: {"user":"hogehoge"} // JSON
	// / updateInfo: {"$set":{"user":"hoge"}} // JSON
	// / => updates documents' attribute "user" to "hoge" which documents has
	// attribute user with "hogehoge" value.
	updateByCondition : function(callback, collName, criteria, updateInfo) {
		Persistor.prototype.eb().send(Persistor.prototype.pa, {
			"action" : "update",
			"collection" : collName,
			"criteria" : criteria,
			"objNew" : updateInfo,
			"upsert" : false,
			"multi" : true
		}, callback);
	},

	remove : function(callback, collName, id) {
		if (typeof (id) == 'undefined' || id == null) {
			atmos.log('id: ' + id);
			throw new Error('remove function can not use without parameter "id".');
		}
		var matcher = {};
		matcher[Persistor.prototype.pk] = id;
		Persistor.prototype.eb().send(Persistor.prototype.pa, {
			"action" : "delete",
			"collection" : collName,
			"matcher" : matcher
		}, callback);
	},

	createInCondition : function(columnName, values) {
		if (atmos.can(columnName) && atmos.can(values)) {
			var inJson = {};
			inJson[Persistor.prototype.condIn] = values;
			var cond = {};
			cond[columnName] = inJson;
			return cond;
		}
		else {
			return null;
		}
	},

	createEqualCondition : function(columnName, value) {
		var cond = {};
		cond[columnName] = value;
		return cond;
	},

	createNotEqualCondition : function(columnName, value) {
		var inner = { "$ne" : value };
		var cond = {};
		cond[columnName] = inner;
		return cond;
	},

	createNotCondition : function(orgCondition) {
		var notCond = {};
		notCond["$not"] = orgCondition;
		return notCond;
	},

	joinConditions : function(joint, conditions) {
		var cond = {};
		cond[joint] = conditions;
		return cond;
	},

	joinConditionsAnd : function(conditions) {
		return Persistor.prototype.joinConditions("$and", conditions);
	},

	joinConditionsOr : function(conditions) {
		return Persistor.prototype.joinConditions("$or", conditions);
	},
};

function getPersistor() {
	var p = new Persistor();
	return p;
}


var RangeCondition = function(columnName) {
	this.columnName = columnName;
	this.greaterThan = null;
	this.lessThan = null;
};
RangeCondition.prototype = {
	gt : "$gt",
	lt : "$lt",
	toJSON : function() {
		var condition = {};
		if (this.greaterThan != null) {
			//TODO: カラム名入れるべし
			condition[this.gt] = this.greaterThan;
		}
		if (this.lessThan != null) {
			condition[this.lt] = this.lessThan;
		}
		return condition;
	}
};

var InCondition = function(columnName) {
	this.columnName = columnName;
	this.values = [];
};
InCondition.prototype = {
	or : "$or",
	addValue : function(value) {
		if (typeof(value) != 'undefined' && value != null) {
			this.values.push(value);
		}
	},
	addValues : function(values) {
		if (typeof(values) != 'undefined' && value != null) {
			for (var i=0; i<values.length; i++) {
				this.addValue(values[i]);
			}
		}
	},
	toJSON : function() {
		var condition = {};
		if (this.values.length > 0) {
			var ors = [];
			for (var i=0; i<this.values.length; i++) {
				var o = {};
				o[this.columnName] = this.values[i];
				ors.push(o);
			}
			condition[this.or] = ors;
		}
		return condition;
	}
};
