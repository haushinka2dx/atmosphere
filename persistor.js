load('vertx.js');
load('atmos_debug.js');
load('constants.js');

var Persistor = function() {
};
Persistor.prototype = {
	pa : getConstants().persistorAddress,

	eb : function() {
		var eb = vertx.eventBus;
		return eb;
	},

	pk : "_id",
	createdAt : "created_at",
	createdBy : "created_by",
	userId : "username",

	condLessThan : "$lt",
	condGreaterThan : "$gt",

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

		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			ebMsg,
			callback
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
			condition[this.gt] = this.greaterThan;
		}
		if (this.lessThan != null) {
			condition[this.lt] = this.lessThan;
		}
		return condition;
	}
};
