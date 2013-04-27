var PathInfo = function() {};
PathInfo.prototype = {
	categoryNameMessages: 'messages',
	categoryNameAnnounce: 'announce',
	categoryNamePrivate: 'private',
	categoryNameMonolog: 'monolog',
	categoryNameRelationship: 'relationship',
	categoryNameRead: 'read',

	subCategoryNameTimeline: 'timeline',
	subCategoryNameSay: 'say',
	subCategoryNameTalk: 'talk',
	subCategoryNameSend: 'send',
	subCategoryNameListen: 'listen',
	subCategoryNameStatus: 'status',
	subCategoryNameSet: 'set',
	subCategoryNameCancel: "cancel",
}

PathInfo.prototype.pMessagesTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pMessagesSay = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameSay);
PathInfo.prototype.pMessagesTalk = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameTalk);
PathInfo.prototype.pMessagesCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNameMessages, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pAnnounceTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameAnnounce, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pAnnounceSend = createRouteMatcherPattern(PathInfo.prototype.categoryNameAnnounce, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pAnnounceCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNameAnnounce, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pPrivateTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pPrivateSend = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pPrivateCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNamePrivate, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pMonologTimeline = createRouteMatcherPattern(PathInfo.prototype.categoryNameMonolog, PathInfo.prototype.subCategoryNameTimeline);
PathInfo.prototype.pMonologSend = createRouteMatcherPattern(PathInfo.prototype.categoryNameMonolog, PathInfo.prototype.subCategoryNameSend);
PathInfo.prototype.pMonologCancel = createRouteMatcherPattern(PathInfo.prototype.categoryNameMonolog, PathInfo.prototype.subCategoryNameCancel);
PathInfo.prototype.pRelationshipStatus = createRouteMatcherPattern(PathInfo.prototype.categoryNameRelationship, PathInfo.prototype.subCategoryNameStatus);
PathInfo.prototype.pRelationshipListen = createRouteMatcherPattern(PathInfo.prototype.categoryNameRelationship, PathInfo.prototype.subCategoryNameListen);
PathInfo.prototype.pReadSet = createRouteMatcherPattern(PathInfo.prototype.categoryNameRead, PathInfo.prototype.subCategoryNameSet)

function getPathInfo() {
	var p = new PathInfo();
	return p;
}

function createRouteMatcherPattern(category, subCategory) {
	return '/' + category + '/' + subCategory;
}

var Constants = function() {};
Constants.prototype = {
	hostname: "localhost",
	listenPort: 9999,
	persistorAddress: "atmos_persistor",
	persistorHostname: "localhost",
	persistorPort: 27017,
	persistorDbName: "atmosphere",
	pathInfo: getPathInfo(),
}

function getConstants() {
	var c = new Constants();
	return c;
}
