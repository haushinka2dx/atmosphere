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
		if (!atmos.canl(extension)) {
			//本来はこの処理は不要だが、拡張子がないと persistor の insert でコケるので便宜上入れている
			extension = 'unknown';
		}
		if (extension == 'jpg' || extension == 'png') {
			var basePath = atmos.constants.attachmentsImageBasePath;
		}
		else {
			var basePath = atmos.constants.attachmentsEtcBasePath;
		}

		var createBaseDirectoriesCallback = atmos.createCallback(
			function(basePathYYYYMMDD) {
				var attachmentFilename = atmos.createTemporaryFileName(extension);
				var attachmentFilePath = basePathYYYYMMDD + attachmentFilename;
				vertx.fileSystem.move(temporaryFilePath, attachmentFilePath, function(errorOccured) {
					if (!errorOccured) {
						attachmentInfo = {};
						attachmentInfo[AttachmentsManager.prototype.persistor.pk] = attachmentFilename;
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
			},
			this
		);
		this.createBaseDirectories(createBaseDirectoriesCallback, basePath, new Date());
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

	createBaseDirectories : function(callbackInfo, basePath, targetDate) {
		vertx.fileSystem.mkDir(basePath, true, function(errMkdir, res) {
			var month = targetDate.getUTCMonth() + 1;
			var monthStr = month < 10 ? '0' + month : '' + month;
			var basePathYYYYMM = basePath + targetDate.getUTCFullYear() + monthStr;
			vertx.fileSystem.mkDir(basePathYYYYMM, true, function(errMkdir, res) {
				var day = targetDate.getUTCDate();
				var dayStr = day < 10 ? '0' + day : '' + day;
				var basePathYYYYMMDD = basePathYYYYMM + '/' + dayStr;
				vertx.fileSystem.mkDir(basePathYYYYMMDD, true, function(errMkdir, res) {
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire(basePathYYYYMMDD + '/');
					}
				});
			});
		});
	}
};

function getAttachmentsManager() {
	var u = new AttachmentsManager();
	return u;
}
