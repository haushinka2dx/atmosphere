load('main/handlers/atmos_handler.js');
load('main/core/constants.js');
load('main/core/persistor.js');

function AttachmentsHandler() {
	var collectionName = getConstants().authCollectionName;
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
AttachmentsHandler.prototype = Object.create(AtmosHandler.prototype);
AttachmentsHandler.prototype.constructor = AttachmentsHandler;

AttachmentsHandler.prototype.paramNameAttachmentId = 'id';
AttachmentsHandler.prototype.paramNameImageWidth = 'image_width';
AttachmentsHandler.prototype.paramNameImageHeight = 'image_height';
AttachmentsHandler.prototype.paramNameAttachmentFile = 'attachment_file';

AttachmentsHandler.prototype.upload = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getUploadedFilesCallback = atmos.createCallback(
				function(uploadedFiles) {
					atmos.log('uploadedFiles on attachments_handler: ' + JSON.stringify(uploadedFiles));
					var uploadCallback = atmos.createCallback(
						function(attachmentsUploadResult) {
							req.sendResponse(JSON.stringify(attachmentsUploadResult));
						},
						this
					);
					atmos.attachments.upload(
						uploadCallback,
						currentUserId,
						uploadedFiles[AttachmentsHandler.prototype.paramNameAttachmentFile]['dataPath'],
						uploadedFiles[AttachmentsHandler.prototype.paramNameAttachmentFile]['filename']
					);
				},
				this
			);
			req.getUploadedFiles(
				getUploadedFilesCallback
			);
		},
		this
	);
	req.getCurrentUserId(
		getCurrentUserIdCallback
	);
};

AttachmentsHandler.prototype.download = function(req) {
	var attachmentId = req.getQueryValue(AttachmentsHandler.prototype.paramNameAttachmentId);
	var imageWidth = req.getQueryValue(AttachmentsHandler.prototype.paramNameImageWidth);
	var imageHeight = req.getQueryValue(AttachmentsHandler.prototype.paramNameImageHeight);
	atmos.log(AttachmentsHandler.prototype.paramNameAttachmentId + ': ' + attachmentId);
	if (atmos.can(attachmentId)) {
		var getAttachmentCallback = atmos.createCallback(
			function(attachmentInfo) {
				atmos.log('attachmentInfo: ' + JSON.stringify(attachmentInfo));
				if (atmos.can(attachmentInfo)) {
					var attachmentPath = attachmentInfo[atmos.attachments.cnPath];
					var attachmentFilename = attachmentInfo[atmos.attachments.cnFilename];
					if (atmos.isStringEndsWith(attachmentPath, '.jpg') || atmos.isStringEndsWith(attachmentPath, '.png')) {
						if (atmos.canl(imageWidth) && atmos.canl(imageHeight)) {
							//TODO: リダイレクトじゃなくてforwardに出来ないか…
							req.redirect(atmos.constants.urlPrefix + '/' + attachmentPath + '?width=' + imageWidth + '&height=' + imageHeight);
						}
						else {
							req.sendFile(attachmentPath, attachmentFilename);
						}
					}
					else {
						req.sendFile(attachmentPath, attachmentFilename, true);
					}
				}
				else {
					req.sendResponse('file not found', 404);
				}
			},
			this
		);
		atmos.attachments.get(
			getAttachmentCallback,
			attachmentId
		);
	}
	else {
		req.sendResponse("'" + AttachmentsHandler.prototype.paramNameAttachmentId + "' is must be assigned.", 400);
	}
};

AttachmentsHandler.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

function getAttachmentsHandler() {
	var u = new AttachmentsHandler();
	return u;
}
