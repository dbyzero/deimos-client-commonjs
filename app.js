var Engine = require('./src/Engine.js')

//join game
var config = {
	domId : 'gamezone',
	serverURL : 'http://localhost',
	serverPort : '1337',
	serverAssetURL : 'http://localhost:1081',
	// avatarId : 6,
	// sessionId : '95e1f5de8f1b8b82b8ab78b1cd068764'
	avatarId : 1,
	sessionId : '026eb1032db555b4fc27acd7afa3413c'
};

Engine.start(config);