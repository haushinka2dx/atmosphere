/* jshint camelcase: false, quotmark: false, maxlen: false */
'use strict';
var express = require('express');
var http = require('http');
var fs = require('fs');
var config = require('config');

var log4js = require('log4js');
log4js.configure(config.log.config);

var app = express();

// all environments
app.configure('development', function(){
	app.set('port', 3001); // TODO config
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(log4js.connectLogger(log4js.getLogger('Request'), {
		level: 'auto',
		nolog: [ '\\css', '\\.js', '\\.gif' ],
		format: JSON.stringify({
			'remote-addr': ':remote-addr',
			'http-version': ':http-version',
			'method': ':method',
			'url': ':url',
			'content-type': ':req[content-type]',
			'status': ':status',
			'referrer': ':referrer',
			'user-agent': ':user-agent'
		})
	}));
});


// Bootstrap models
var mongoose = require('mongoose');
mongoose.connect(config.db.url);

var modelsPath = __dirname + '/lib/models';
fs.readdirSync(modelsPath).forEach(function(file) {
	if (file.indexOf('.js') !== -1) {
		// TODO debug
		// console.log('[Model] %s', modelsPath + '/' + file);
		require(modelsPath + '/' + file);
	}
});

app.configure('development', function(){
	mongoose.set('debug', true);
});

// Configure passport
var passport = require('passport');
var User = require('models/user');
passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	User.findByUserId(username, function(err, user) {
		done(err, user);
	});
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
			{usernameField: 'user_id', passwordField: 'password'},
			function(username, password, done) {
				User.findByUserId(username, function(err, user) {
					if (err) {
						return done(err);
					}
					if (!user || !user.authenticate(password)) {
						return done(null, false, { message: 'Invalid user or password' });
					}
					return done(null, user);
				});
			}));

app.use(express.favicon());
app.use(express.json());
app.use(express.bodyParser());

function isJSON(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

app.use(function(req, res, next) {
	if (req.method === 'POST') {
		// TODO
		var data = Object.keys(req.body)[0];
		if (isJSON(data)) {
			req.body = JSON.parse(data);
		}
	}
	next();
});
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here')); // TODO
// Configure session
var MongoStore = require('connect-mongo')(express);
var sessionStore = new MongoStore({
		url: config.db.url,
		// Interval in seconds to clear expired sessions. 60 * 60 = 1 hour
		clear_interval: 60 * 60
	});
app.use(express.session({
	secret: 'topsecret', // TODO
	store: sessionStore,
	cookie: {
		httpOnly: false,
		// 60 * 60 * 1000 = 3600000 msec = 1 hour
		maxAge: new Date(Date.now() + 60 * 60 * 1000)
	}
}));

app.use(require('connect-flash')());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	if (req.sessionID) {
		res.header('atmosphere-session-id', req.sessionID);
		// TODO options(domain, path, secure, expires)
		res.cookie('atmosphere-session-id', req.sessionID);
	}
	next();
});

app.configure('development', function(){
	app.use(function(req, res, next) {
		var data = {
			query: JSON.stringify(req.query),
			body: JSON.stringify(req.body)
		};
		log4js.getLogger('Param').info(data);
		next();
	});

	app.use(function(req, res, next) {
		var origin = res.json;
		// Proxy for logging
		res.json = function() {
			var data = {
				header: JSON.stringify(res._headers),
				code: arguments.length < 2 ? 200 : arguments[0],
				body: arguments.length < 2 ? JSON.stringify(arguments[0]) : JSON.stringify(arguments[1])
			};
			log4js.getLogger('Response').info(data);
			return origin.apply(this, arguments);
		};
		next();
	});
});

app.use(app.router);

// Bootstrap routes
require('./routes')(app, passport);

// for test
module.exports = app;

// TODO 最終的なネスト深い
if (!module.parent) {
	var wsPool = require('./routes/websocket_pool');
	// WebSocket
	var notifyServer = require('sockjs').createServer();
	notifyServer.on('connection', function(conn) {
		conn.on('data', function(message) {
			var msgJSON = JSON.parse(message);
			var sessionId = msgJSON["atmosphere-session-id"];
			if (msgJSON.action === 'start' && sessionId) {
				sessionStore.get(sessionId, function(err, session) {
					if (err) {
						// TODO
						console.log(err);
					} else {
						wsPool.regist(session.passport.user, conn);
					}
				});
			}

			console.log("WS:data:", message);
			conn.write(message);
		});
	});

	var apiServer = http.createServer(app);
	apiServer.listen(config.api.port, config.api.host, function(){
		console.log('API server listening on %s:%s ', config.api.host, config.api.port);
	});

	notifyServer.installHandlers(apiServer, {prefix: '/notify'});
	apiServer.listen(config.notify.port, config.notify.host, function(){
		console.log('Streaming server listening on %s:%s ', config.notify.host, config.notify.port);
	});
}

app.configure('development', function(){
	// TODO 設定ファイルに切り出す？
	User.registAdmin('admin', 'admin', function(){});
	User.regist('bob', 'bob', function(){});

	var Group = require('models/group');
	Group.adminIds.forEach(function(id) {
		Group.registSystem(id, 'admin', function(){});
	});
});
