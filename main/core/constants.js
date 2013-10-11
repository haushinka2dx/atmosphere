var PathInfo = function() {
};
PathInfo.prototype = {
	categoryNameMessages : 'messages',
	categoryNamePrivate : 'private',
	categoryNameRelationship : 'relationship',
	categoryNameRead : 'read',
	categoryNameAuth : 'auth',
	categoryNameUser : 'user',
	categoryNameGroup : 'group',

	subCategoryNameTimeline : 'timeline',
	subCategoryNameGlobalTimeline : 'global_timeline',
	subCategoryNameFocusedTimeline : 'focused_timeline',
	subCategoryNameTalkTimeline : 'talk_timeline',
	subCategoryNameAnnounceTimeline : 'announce_timeline',
	subCategoryNameMonologTimeline : 'monolog_timeline',
	subCategoryNameSearch : 'search',
	subCategoryNameSend : 'send',
	subCategoryNameListen : 'listen',
	subCategoryNameListeners : 'listeners',
	subCategoryNameSpeakers : 'speakers',
	subCategoryNameStatus : 'status',
	subCategoryNameSet : 'set',
	subCategoryNameCancel : "cancel",
	subCategoryNameDestroy : "destroy",
	subCategoryNameResponse : "response",
	subCategoryNameRemoveResponse : "remove_response",
	subCategoryNameLogin : "login",
	subCategoryNameLogout : "logout",
	subCategoryNameWhoami : "whoami",
	subCategoryNameRegister : "register",
	subCategoryNameList : "list",
	subCategoryNameAddMember : "add_member",
	subCategoryNameRemoveMember : "remove_member",
	subCategoryNameAvator : "avator",
	subCategoryNameChangeAvator : "change_avator",
	subCategoryNameChangePassword : "change_password",
};

PathInfo.prototype.pMessagesTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pMessagesGlobalTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameGlobalTimeline);
PathInfo.prototype.pMessagesFocusedTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameFocusedTimeline);
PathInfo.prototype.pMessagesTalkTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameTalkTimeline);
PathInfo.prototype.pMessagesAnnounceTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameAnnounceTimeline);
PathInfo.prototype.pMessagesMonologTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameMonologTimeline);
PathInfo.prototype.pMessagesSearch = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameSearch);
PathInfo.prototype.pMessagesSend = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pMessagesCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pMessagesDestroy = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameDestroy);
PathInfo.prototype.pMessagesResponse = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameResponse);
PathInfo.prototype.pMessagesRemoveResponse = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameRemoveResponse);
PathInfo.prototype.pPrivateTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pPrivateSend = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pPrivateCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pPrivateDestroy = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameDestroy);
PathInfo.prototype.pPrivateResponse = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameResponse);
PathInfo.prototype.pRelationshipStatus = createRouteMatcherPattern(PathInfo.prototype.categoryNameRelationship, PathInfo.prototype.subCategoryNameStatus);
PathInfo.prototype.pRelationshipListen = createRouteMatcherPattern(PathInfo.prototype.categoryNameRelationship, PathInfo.prototype.subCategoryNameListen);
PathInfo.prototype.pRelationshipListeners = createRouteMatcherPattern(PathInfo.prototype.categoryNameRelationship, PathInfo.prototype.subCategoryNameListeners);
PathInfo.prototype.pRelationshipSpeakers = createRouteMatcherPattern(PathInfo.prototype.categoryNameRelationship, PathInfo.prototype.subCategoryNameSpeakers);
PathInfo.prototype.pReadSet = createRouteMatcherPattern(PathInfo.prototype.categoryNameRead, PathInfo.prototype.subCategoryNameSet);
PathInfo.prototype.pAuthLogin = createRouteMatcherPattern(PathInfo.prototype.categoryNameAuth, PathInfo.prototype.subCategoryNameLogin);
PathInfo.prototype.pAuthLogout = createRouteMatcherPattern(PathInfo.prototype.categoryNameAuth, PathInfo.prototype.subCategoryNameLogout);
PathInfo.prototype.pAuthWhoami = createRouteMatcherPattern(PathInfo.prototype.categoryNameAuth, PathInfo.prototype.subCategoryNameWhoami);
PathInfo.prototype.pUserList = createRouteMatcherPattern(PathInfo.prototype.categoryNameUser, PathInfo.prototype.subCategoryNameList);
PathInfo.prototype.pUserRegister = createRouteMatcherPattern(PathInfo.prototype.categoryNameUser, PathInfo.prototype.subCategoryNameRegister);
PathInfo.prototype.pUserAvator = createRouteMatcherPattern(PathInfo.prototype.categoryNameUser, PathInfo.prototype.subCategoryNameAvator);
PathInfo.prototype.pUserChangeAvator = createRouteMatcherPattern(PathInfo.prototype.categoryNameUser, PathInfo.prototype.subCategoryNameChangeAvator);
PathInfo.prototype.pUserChangePassword = createRouteMatcherPattern(PathInfo.prototype.categoryNameUser, PathInfo.prototype.subCategoryNameChangePassword);
PathInfo.prototype.pGroupList = createRouteMatcherPattern(PathInfo.prototype.categoryNameGroup, PathInfo.prototype.subCategoryNameList);
PathInfo.prototype.pGroupRegister = createRouteMatcherPattern(PathInfo.prototype.categoryNameGroup, PathInfo.prototype.subCategoryNameRegister);
PathInfo.prototype.pGroupDestroy = createRouteMatcherPattern(PathInfo.prototype.categoryNameGroup, PathInfo.prototype.subCategoryNameDestroy);
PathInfo.prototype.pGroupAddMember = createRouteMatcherPattern(PathInfo.prototype.categoryNameGroup, PathInfo.prototype.subCategoryNameAddMember);
PathInfo.prototype.pGroupRemoveMember = createRouteMatcherPattern(PathInfo.prototype.categoryNameGroup, PathInfo.prototype.subCategoryNameRemoveMember);

function getPathInfo() {
	var p = new PathInfo();
	return p;
}

function createRouteMatcherPattern(category, subCategory) {
	return '/' + category + '/' + subCategory;
}

var ResponseAction = function() {
};
ResponseAction.prototype = {
	memo : "memo",
	usefull : "usefull",
	good : "good",
	fun : "fun",
	all : function() {
		return [ ResponseAction.prototype.memo, ResponseAction.prototype.usefull, ResponseAction.prototype.good, ResponseAction.prototype.fun ];
	},
	contains : function(action) {
		var all = ResponseAction.prototype.all();
		for (var i=0; i<all.length; i++) {
			if (action === all[i]) {
				return true;
			}
		}
		return false;
	},
}

function getResponseAction() {
	var r = new ResponseAction();
	return r;
}

var Constants = function() {
};
Constants.prototype = {
	restAPIHostname : "localhost",
	restAPIListenPort : 9999,
	streamingHostname : "localhost",
	streamingListenPort : 9998,
	persistorAddress : "atmos_persistor",
	persistorHostname : "localhost",
	persistorPort : 27017,
	persistorDbName : "atmosphere2",
	sessionManagerAddress : "atmos_session_manager",
	sessionTimeoutMilliseconds : 10 * 60 * 1000,
	sessionCleanedNotifyAddress : null,
	sessionIdPrefix : "atmos_",
	authManagerAddress : "atmos_auth_manager",
	authTimeoutMilliseconds : 10 * 60 * 1000,
	authCollectionName : "users",
	headerNameSessionId : "atmosphere-session-id",
	pathInfo : getPathInfo(),
	responseAction : getResponseAction(),
	// TODO: This is used for encrypt the user password. Please change YOUR OWN PASSWORD!!!
	encryptionPassword : 'TylXnUBvR7K4W7OiB0R1YQ',
	encryptionIV : 'yiECSaQ3LHiA45A9xnEhKg',
	encryptionSalt : 'AISjp4NgA+o',
	// TODO: Please change admin information
	adminUserId : 'admin',
	adminPassword : 'password',

	adminGroupIds : [ 'admin', 'infra' ],

	temporaryPath : 'tmp/',

	avatorBasePath : 'uploaded/avator/',

	publishDelaySeconds : 5,
};

function getConstants() {
	var c = new Constants();
	return c;
}
