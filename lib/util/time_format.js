'use strict';
var _ = require('underscore');
_.str = require('underscore.string');

function paddingTwoDigits(num) {
	return _.str.pad(num, 2, '0');
}

// return "yyyy/mm/dd hh:mm:ss"
function getFormattedTime(date) {
	if (_.isDate(date)) {
		return _.str.sprintf('%s/%s/%s %s:%s:%s',
									date.getFullYear(),
									paddingTwoDigits(date.getMonth() + 1),
									paddingTwoDigits(date.getDate()),
									paddingTwoDigits(date.getHours()),
									paddingTwoDigits(date.getMinutes()),
									paddingTwoDigits(date.getSeconds()));
	}
	return '';
}

exports.getFormattedTime = getFormattedTime;

//現在時刻取得(yyyy/mm/dd hh:mm:ss)
exports.getCurrentTime = function() {
	return getFormattedTime(new Date());
};
