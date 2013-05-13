load('atmosphere.js');

var CommonHandler = function() {
};
CommonHandler.prototype = {
	returnCodeArgumentMissingError : 110,
	returnMessageArgumentMissingError : "There are no required argument(s).",
	returnCodeArgumentInvalidFormatError : 120,
	returnMessageArgumentInvalidFormatError : "Some argument(s) are not correct format.",
	returnCodeSystemError : 999,
	returnMessageSystemError : "Unexpected error occured.",

	paramNameSearchCondition : "where",
	paramNameUpdateInformation : "update_info",
	persistor : atmos.persistor,

	createResponse : function(code, additionalMsg) {
		var r = {};
		r['code'] = code;
		r['msg'] = CommonHandler.prototype.getErrorMsg(code);
		r['remarks'] = additionalMsg;
		return r;
	},
	getErrorMsg : function(code) {
		if (code == CommonHandler.prototype.returnCodeArgumentMissingError) {
			return CommonHandler.prototype.returnMessageArgumentMissingError;
		} else if (code == CommonHandler.prototype.returnCodeArgumentInvalidFormatError) {
			return CommonHandler.prototype.returnMessageArgumentInvalidFormatError;
		} else {
			return CommonHandler.prototype.returnMessageSystemError;
		}
	}
};
