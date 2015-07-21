var Engine = require('./src/Engine.js')

//join game
var config = {
	domId : 'gamezone',
	serverURL : 'http://localhost',
	serverPort : '40000',
	serverAssetURL : 'http://localhost:1082',
	avatarId : 10,
	sessionId : '123123123123123'
};

Engine.start(config);