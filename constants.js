var categoryNameMessages = 'messages';
var categoryNameAnnounce = 'announce';
var categoryNamePrivate = 'private';
var categoryNameMonolog = 'monolog';
var categoryNameRelationship = 'relationship';
var categoryNameRead = 'read';

var subCategoryNameTimeline = 'timeline';
var subCategoryNameSay = 'say';
var subCategoryNameTalk = 'talk';
var subCategoryNameSend = 'send';
var subCategoryNameListen = 'listen';
var subCategoryNameStatus = 'status';
var subCategoryNameSet = 'set';
var subCategoryNameCancel = 'cancel';

var pMessagesTimeline = createRouteMatcherPattern([categoryNameMessages, subCategoryNameTimeline]);
var pMessagesSay = createRouteMatcherPattern([categoryNameMessages, subCategoryNameSay]);
var pMessagesTalk = createRouteMatcherPattern([categoryNameMessages, subCategoryNameTalk]);
var pMessagesCancel = createRouteMatcherPattern([categoryNameMessages, subCategoryNameCancel]);
var pAnnounceTimeline = createRouteMatcherPattern([categoryNameAnnounce, subCategoryNameTimeline]);
var pAnnounceSend = createRouteMatcherPattern([categoryNameAnnounce, subCategoryNameSend]);
var pAnnounceCancel = createRouteMatcherPattern([categoryNameAnnounce, subCategoryNameCancel]);
var pPrivateTimeline = createRouteMatcherPattern([categoryNamePrivate, subCategoryNameTimeline]);
var pPrivateSend = createRouteMatcherPattern([categoryNamePrivate, subCategoryNameSend]);
var pPrivateCancel = createRouteMatcherPattern([categoryNamePrivate, subCategoryNameCancel]);
var pMonologTimeline = createRouteMatcherPattern([categoryNameMonolog, subCategoryNameTimeline]);
var pMonologSend = createRouteMatcherPattern([categoryNameMonolog, subCategoryNameSend]);
var pMonologCancel = createRouteMatcherPattern([categoryNameMonolog, subCategoryNameCancel]);
var pRelationshipStatus = createRouteMatcherPattern([categoryNameRelationship, subCategoryNameStatus]);
var pRelationshipListen = createRouteMatcherPattern([categoryNameRelationship, subCategoryNameListen]);
var pReadSet = createRouteMatcherPattern([categoryNameRead, subCategoryNameSet]);

function createRouteMatcherPattern(urlElements) {
	return '/' + urlElements.join('/');
}
