var socketio = require('socket.io-client');

var Engine = {};

var initConfig = null;
var gameLoop = null;
var gameServerConnection = null;

Engine.start = function(config) {
	console.log('Using configuration :');
	console.log(config);

	var initConfig = config;

	// socketio.connect(config.serverURL+':'+config.serverPort);
}

module.exports = Engine;