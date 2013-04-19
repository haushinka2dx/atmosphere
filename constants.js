load('vertx.js');

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

	pMessagesTimeline: undefined,
	pMessagesSay: undefined,
	pMessagesTalk: undefined,
	pMessagesCancel: undefined,
	pAnnounceTimeline: undefined,
	pAnnounceSend: undefined,
	pAnnounceCancel: undefined,
	pPrivateTimeline: undefined,
	pPrivateSend: undefined,
	pPrivateCancel: undefined,
	pMonologTimeline: undefined,
	pMonologSend: undefined,
	pMonologCancel: undefined,
	pRelationshipStatus: undefined,
	pRelationshipListen: undefined,
	pReadSet: undefined,
}

function getPathInfo() {
	var p = new PathInfo();
	
	p.pMessagesTimeline = createRouteMatcherPattern(p.categoryNameMessages, p.subCategoryNameTimeline);
	p.pMessagesSay = createRouteMatcherPattern(p.categoryNameMessages, p.subCategoryNameSay),
	p.pMessagesTalk = createRouteMatcherPattern(p.categoryNameMessages, p.subCategoryNameTalk),
	p.pMessagesCancel = createRouteMatcherPattern(p.categoryNameMessages, p.subCategoryNameCancel),
	p.pAnnounceTimeline = createRouteMatcherPattern(p.categoryNameAnnounce, p.subCategoryNameTimeline),
	p.pAnnounceSend = createRouteMatcherPattern(p.categoryNameAnnounce, p.subCategoryNameSend),
	p.pAnnounceCancel = createRouteMatcherPattern(p.categoryNameAnnounce, p.subCategoryNameCancel),
	p.pPrivateTimeline = createRouteMatcherPattern(p.categoryNamePrivate, p.subCategoryNameTimeline),
	p.pPrivateSend = createRouteMatcherPattern(p.categoryNamePrivate, p.subCategoryNameSend),
	p.pPrivateCancel = createRouteMatcherPattern(p.categoryNamePrivate, p.subCategoryNameCancel),
	p.pMonologTimeline = createRouteMatcherPattern(p.categoryNameMonolog, p.subCategoryNameTimeline),
	p.pMonologSend = createRouteMatcherPattern(p.categoryNameMonolog, p.subCategoryNameSend),
	p.pMonologCancel = createRouteMatcherPattern(p.categoryNameMonolog, p.subCategoryNameCancel),
	p.pRelationshipStatus = createRouteMatcherPattern(p.categoryNameRelationship, p.subCategoryNameStatus),
	p.pRelationshipListen = createRouteMatcherPattern(p.categoryNameRelationship, p.subCategoryNameListen),
	p.pReadSet = createRouteMatcherPattern(p.categoryNameRead, p.subCategoryNameSet)

	return p;
}

function createRouteMatcherPattern(category, subCategory) {
	return '/' + category + '/' + subCategory;
}
