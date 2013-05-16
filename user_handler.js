load('atmos_handler.js');
load('constants.js');
load('persistor.js');

function UserHandler() {
	var collectionName = getConstants().authCollectionName;
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
UserHandler.prototype = Object.create(AtmosHandler.prototype);
UserHandler.prototype.constructor = UserHandler;

UserHandler.prototype.paramNameBeforeUserId = "before_user_id";
UserHandler.prototype.paramNameAfterUserId = "after_user_id";

UserHandler.prototype.list = function(req) {
	var where = {};
	var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}

	var userIdRange = new RangeCondition(Persistor.prototype.userId);
	var beforeUserIdSrc = req.getQueryValue(UserHandler.prototype.paramNameBeforeUserId);
	if (beforeUserIdSrc != null && beforeUserIdSrc.length > 0) {
		userIdRange.lessThan = beforeUserIdSrc;
	}
	var afterUserIdSrc = req.getQueryValue(UserHandler.prototype.paramNameAfterUserId);
	if (afterUserIdSrc != null && afterUserIdSrc.length > 0) {
		userIdRange.greaterThan = afterUserIdSrc;
	}

	var limit = -1;
	var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);
	atmos.log('count: ' + count);
	if (count != null && count > 0) {
		limit = count;
	}

	// default sort new -> old
	var sort = {};
	sort[Persistor.prototype.userId] = 1;

	AtmosHandler.prototype.persistor.find(function(ret) {
		if (ret['status'] === 'ok') {
			var res = {};
			res['status'] = 'ok';
			res['count'] = ret['number'];
			res['results'] = [];
			for (var i=0; i<ret['results'].length; i++) {
				res['results'].push(UserHandler.prototype.createSafetyUserInfo(ret['results'][i]));
			}
			var headUserId = null;
			var tailUserId = null;
			for (var ii=0; ii<ret['results'].length; ii++) {
				var resUserId = ret['results'][ii][Persistor.prototype.userId];
				if (resUserId) {
					if (tailUserId == null || tailUserId > resUserId) {
						tailUserId = resUserId;
					}
					if (headUserId == null || headUserId < resUserId) {
						headUserId = resUserId;
					}
				}
			}
			res['head_user_id'] = tailUserId != null ? tailUserId : '';
			res['tail_user_id'] = headUserId != null ? headUserId : '';
			req.sendResponse(JSON.stringify(res));
		}
		else {
			req.sendResponse(JSON.stringify(ret));
		}
	}, this.collectionName, where, userIdRange, sort, limit);
};

UserHandler.prototype.send = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
		var msg = bodyJSON['message'];

		// extract group_ids from message
		var groupIds = this.extractGroupIds(msg);

		var dataJSON = {};
		dataJSON['message'] = msg;
		dataJSON['addresses'] = groupIds;
		this.sendInternal(req, dataJSON);
	});
};

UserHandler.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

UserHandler.prototype.createSafetyUserInfo = function(userInfo) {
	var safeUserInfo = {
		"user_id" : userInfo.username
	};
	return safeUserInfo;
};

function getUserHandler() {
	var u = new UserHandler();
	return u;
}
