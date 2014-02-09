load('main/core/constants.js');
load('main/core/persistor.js');

var AttachmentsManager = function() {
};
AttachmentsManager.prototype = {
	collectionName : 'attachments',
	persistor : getPersistor(),

	cnPath : 'path',
	cnType : 'type',
	cnFilename : 'filename',

	upload : function(callbackInfo, userId, temporaryFilePath, originalFilename) {
		// move uploaded file from temporary directory to formal directory
		var filenameParts = temporaryFilePath.split('/');
		var filename = filenameParts.length > 0 ? filenameParts[filenameParts.length - 1] : temporaryFilePath;
		var extension = atmos.getExtension(filename);
		if (extension == 'jpg' || extension == 'png') {
			var basePath = atmos.constants.attachmentsImageBasePath;
		}
		else {
			var basePath = atmos.constants.attachmentsEtcBasePath;
		}
		vertx.fileSystem.mkDir(basePath, true, function(errMkdir, res) {
			var attachmentFilePath = basePath + atmos.createTemporaryFileName(extension);
			vertx.fileSystem.move(temporaryFilePath, attachmentFilePath, function(errorOccured) {
				if (!errorOccured) {
					attachmentInfo = {};
					attachmentInfo[AttachmentsManager.prototype.cnPath] = attachmentFilePath;
					attachmentInfo[AttachmentsManager.prototype.cnFilename] = originalFilename;
					if (extension == 'jpg' || extension == 'png') {
						attachmentInfo[AttachmentsManager.prototype.cnType] = 'image';
					}
					else {
						attachmentInfo[AttachmentsManager.prototype.cnType] = 'etc';
					}
					AttachmentsManager.prototype.persistor.insert(
						function(res) {
							if (atmos.can(callbackInfo)) {
								callbackInfo.fire(res);
							}
						},
						AttachmentsManager.prototype.collectionName,
						attachmentInfo,
						userId
					);
				}
				else {
					callbackInfo.fire({"status":"error"});
				}
			});
		});
	},

	get : function(callbackInfo, attachmentId) {
		var attachmentsCallback = atmos.createCallback(
			function(attachmentsResult) {
				var resultAttachmentInfo = null;
				if (attachmentsResult['count'] > 0) {
					resultAttachmentInfo = attachmentsResult['results'][0];
				}
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(resultAttachmentInfo);
				}
			},
			this 
		);
		AttachmentsManager.prototype.getAttachmentsByIds(
			attachmentsCallback,
			[ attachmentId ]
		);
	},

	getAttachmentsByIds : function(callbackInfo, attachmentIds) {
		var whereIn = AttachmentsManager.prototype.persistor.createInCondition(AttachmentsManager.prototype.persistor.pk, attachmentIds);
		AttachmentsManager.prototype.persistor.find(
			function(res) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(AttachmentsManager.prototype.createResult(res));
				}
			},
			AttachmentsManager.prototype.collectionName,
			whereIn
		);
	},

	createResult : function(ret) {
		if (ret['status'] === 'ok') {
			var res = {};
			res['status'] = 'ok';
			res['count'] = ret['number'];
			res['results'] = [];
			for (var i=0; i<ret['results'].length; i++) {
				res['results'].push(ret['results'][i]);
			}
			return res;
		}
		else {
			return ret;
		}
	},
};

function getAttachmentsManager() {
	var u = new AttachmentsManager();
	return u;
}
