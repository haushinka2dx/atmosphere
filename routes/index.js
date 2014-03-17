'use strict';
var auth = require('./auth');
var user = require('./user');
var group = require('./group');
var message = require('./message');
var privateMessage = require('./private');
var relationship = require('./relationship');
var read = require('./read');

function requiredLogin(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.json(401, {status: 'error', message: 'You are not logged in.'});
}

function wrapApp(app) {
	var wrap = app;
	wrap.authGet = function(url, callback) {
		return this.get(url, requiredLogin, callback);
	};
	wrap.authPost = function(url, callback) {
		return this.post(url, requiredLogin, callback);
	};
	return wrap;
}

module.exports = function(app, passport) {
	var _app = wrapApp(app);

	_app.get('/auth/logout', auth.logout);
	_app.authGet('/auth/whoami', auth.whoami);
	_app.authGet('/user/list', user.list);
	_app.authGet('/user/show', user.show);
	_app.authGet('/user/avator', user.avator);
	_app.authGet('/group/list', group.list);
	_app.authGet('/messages/search', message.search);
	_app.authGet('/messages/timeline', message.timeline);
	_app.authGet('/messages/global_timeline', message.timeline);
	_app.authGet('/messages/focused_timeline', message.focusedTimeline);
	_app.authGet('/messages/talk_timeline', message.talkTimeline);
	_app.authGet('/messages/announce_timeline', message.announceTimeline);
	_app.authGet('/messages/monolog_timeline', message.monologTimeline);
	_app.authGet('/private/timeline', privateMessage.timeline);
	_app.authGet('/private/search', privateMessage.search);
	_app.authGet('/relationship/status', relationship.status);
	_app.authGet('/relationship/speakers', relationship.speakers);
	_app.authGet('/relationship/listeners', relationship.listeners);

	_app.post('/auth/login', passport.authenticate('local'), auth.login);
	_app.authPost('/user/register', user.register);
	_app.authPost('/user/change_password', user.changePassword);
	_app.authPost('/user/change_profile', user.changeProfile);
	_app.authPost('/user/change_avator', user.changeAvator);
	_app.authPost('/group/register', group.register);
	_app.authPost('/group/destroy', group.destroy);
	_app.authPost('/group/add_member', group.addMember);
	_app.authPost('/group/remove_member', group.removeMember);
	_app.authPost('/messages/send', message.send);
	_app.authPost('/messages/cancel', message.cancel);
	_app.authPost('/messages/destroy', message.destroy);
	_app.authPost('/messages/response', message.response);
	_app.authPost('/messages/remove_response', message.removeResponse);
	_app.authPost('/private/send', privateMessage.send);
	_app.authPost('/private/cancel', privateMessage.cancel);
	_app.authPost('/private/destroy', privateMessage.destroy);
	_app.authPost('/private/response', privateMessage.response);
	_app.authPost('/private/remove_response', privateMessage.removeResponse);
	_app.authPost('/read/set', read.set);
	_app.authPost('/relationship/listen', relationship.listen);

	_app.use(function(req, res){
		res.json(404, {status: 'ng', message: 'No such API'});
	});
};
