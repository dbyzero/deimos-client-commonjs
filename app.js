var Engine = require('./src/Engine.js')

//join game
var config = {
	domId : 'gamezone',
	serverURL : 'http://localhost',
	serverPort : '1337',
	serverAssetURL : 'http://localhost:1081',
	// avatarId : 6,
	// sessionId : '17f7c9d12177d61954887156972a11e3'
	avatarId : 1,
	sessionId : '026eb1032db555b4fc27acd7afa3413c'
};

Engine.start(config);