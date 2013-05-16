var PathInfo = function() {
};
PathInfo.prototype = {
	categoryNameMessages : 'messages',
	categoryNameAnnounce : 'announce',
	categoryNamePrivate : 'private',
	categoryNameMonolog : 'monolog',
	categoryNameRelationship : 'relationship',
	categoryNameRead : 'read',
	categoryNameAuth : 'auth',
	categoryNameUser : 'user',
	categoryNameGroup : 'group',

	subCategoryNameTimeline : 'timeline',
	subCategoryNameSend : 'send',
	subCategoryNameListen : 'listen',
	subCategoryNameStatus : 'status',
	subCategoryNameSet : 'set',
	subCategoryNameCancel : "cancel",
	subCategoryNameDestroy : "destroy",
	subCategoryNameResponse : "response",
	subCategoryNameLogin : "login",
	subCategoryNameLogout : "logout",
	subCategoryNameWhoami : "whoami",
	subCategoryNameRegister : "register",
	subCategoryNameList : "list",
};

PathInfo.prototype.pMessagesTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pMessagesSend = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pMessagesCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pMessagesDestroy = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameDestroy);
PathInfo.prototype.pMessagesResponse = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameResponse);
PathInfo.prototype.pAnnounceTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameAnnounce, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pAnnounceSend = createRouteMatcherPattern(PathInfo.prototype.categoryNameAnnounce, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pAnnounceCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNameAnnounce, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pAnnounceDestroy = createRouteMatcherPattern(PathInfo.prototype.categoryNameAnnounce, PathInfo.prototype.subCategoryNameDestroy);
PathInfo.prototype.pAnnounceResponse = createRouteMatcherPattern(PathInfo.prototype.categoryNameAnnounce, PathInfo.prototype.subCategoryNameResponse);
PathInfo.prototype.pPrivateTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pPrivateSend = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pPrivateCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pPrivateDestroy = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameDestroy);
PathInfo.prototype.pPrivateResponse = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameResponse);
PathInfo.prototype.pMonologTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMonolog, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pMonologSend = createRouteMatcherPattern(PathInfo.prototype.categoryNameMonolog, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pMonologCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNameMonolog, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pMonologDestroy = createRouteMatcherPattern(PathInfo.prototype.categoryNameMonolog, PathInfo.prototype.subCategoryNameDestroy);
PathInfo.prototype.pMonologResponse = createRouteMatcherPattern(PathInfo.prototype.categoryNameMonolog, PathInfo.prototype.subCategoryNameResponse);
PathInfo.prototype.pRelationshipStatus = createRouteMatcherPattern(PathInfo.prototype.categoryNameRelationship, PathInfo.prototype.subCategoryNameStatus);
PathInfo.prototype.pRelationshipListen = createRouteMatcherPattern(PathInfo.prototype.categoryNameRelationship, PathInfo.prototype.subCategoryNameListen);
PathInfo.prototype.pReadSet = createRouteMatcherPattern(PathInfo.prototype.categoryNameRead, PathInfo.prototype.subCategoryNameSet);
PathInfo.prototype.pAuthLogin = createRouteMatcherPattern(PathInfo.prototype.categoryNameAuth, PathInfo.prototype.subCategoryNameLogin);
PathInfo.prototype.pAuthLogout = createRouteMatcherPattern(PathInfo.prototype.categoryNameAuth, PathInfo.prototype.subCategoryNameLogout);
PathInfo.prototype.pAuthWhoami = createRouteMatcherPattern(PathInfo.prototype.categoryNameAuth, PathInfo.prototype.subCategoryNameWhoami);
PathInfo.prototype.pUserList = createRouteMatcherPattern(PathInfo.prototype.categoryNameUser, PathInfo.prototype.subCategoryNameList);
PathInfo.prototype.pUserRegister = createRouteMatcherPattern(PathInfo.prototype.categoryNameUser, PathInfo.prototype.subCategoryNameRegister);

function getPathInfo() {
	var p = new PathInfo();
	return p;
}

function createRouteMatcherPattern(category, subCategory) {
	return '/' + category + '/' + subCategory;
}

var Constants = function() {
};
Constants.prototype = {
	hostname : "localhost",
	listenPort : 9999,
	persistorAddress : "atmos_persistor",
	persistorHostname : "localhost",
	persistorPort : 27017,
	persistorDbName : "atmosphere",
	sessionManagerAddress : "atmos_session_manager",
	sessionTimeoutMilliseconds : 10 * 60 * 1000,
	sessionCleanedNotifyAddress : null,
	sessionIdPrefix : "atmos_",
	authManagerAddress : "atmos_auth_manager",
	authTimeoutMilliseconds : 10 * 60 * 1000,
	authCollectionName : "users",
	headerNameSessionId : "atmosphere-session-id",
	pathInfo : getPathInfo(),
};

function getConstants() {
	var c = new Constants();
	return c;
}
