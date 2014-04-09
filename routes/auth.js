/* jshint camelcase: false, quotmark: false */
'use strict';

exports.login = function(req, res){
	res.json({status: 'login successful', 'session_id': req.sessionID});
};

exports.logout = function(req, res){
	req.logout();
	res.json({status: 'ok'});
};

exports.whoami = function(req, res){
	res.json({status: 'ok', user_id: req.user.username});
};
