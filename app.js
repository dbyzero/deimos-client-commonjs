var Engine = require('./src/Engine.js')

//join game
var config = {
	domId : 'gamezone',
	serverURL : 'http://localhost',
	serverPort : '1337',
	serverAssetURL : 'http://localhost:1081',
	// avatarId : 6,
	// sessionId : '89baf3ab3530a558acef59093bc7feb5'
	avatarId : 1,
	sessionId : '73beae6a9660850d0cbdb3dbd4443092'
};

Engine.start(config);