var Engine = require('./src/Engine.js')

//join game
var config = {
	domId : 'gamezone',
	serverURL : 'http://localhost',
	serverPort : '1337',
	serverAssetURL : 'http://localhost:1081',
	avatarId : 1,
	sessionId : '70c928925c9384f0fab58f11cea6815e'
};

Engine.start(config);