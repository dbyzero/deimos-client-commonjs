var socketio = require('socket.io-client');
var ServerConfig = require('./Config');
var Message = require('./Message')[ServerConfig.messageLevel];
var Scene = require('./render/Scene');
var Loop = require('./tools/Loop');
var KeyboardAdapter = require('./tools/KeyboardAdapter');
var Avatar = require('./models/Avatar');
var Vector = require('./tools/Vector');
var UserMovement = require('./tools/UserMovement');

var Engine = {};

var gameLoop = null;
var Socket = null;
var currentAvatar = null;
var inGame = false;
var deltaTimeMs = new Date().getTime();
var lastTimestampUpdate = new Date().getTime();

Engine.start = function(config) {
	//config
	ServerConfig.custom = config;
	console.log('Using configuration :');
	console.log(ServerConfig);

	//Socket
	Socket = socketio.connect(config.serverURL+':'+config.serverPort);
	Socket
		.on('connect',function(){
			onConnectionReady();
		})
		.on('connect_error',function(err){
			onConnectionError(err);
		})
		.on(Message['ACTION_ERROR'],function(message){
			showError(message);
		})
		.on(Message['ACTION_LOGGED_OK'],function(message){
			onLogged(message);
		})
		.on(Message['ACTION_CHOOSE_CHAR_OK'],function(message){
			onJoinGame(message);
		})
		.on(Message['ACTION_SYNC'],function(message){
			Scene.parseData(message);
		})
		.on(Message['ACTION_SYNC_AVATAR'],function(message){
			Scene.syncAvatarFromServer(message);
		})
		.on(Message['ACTION_SYNC_MONSTER'],function(message){
			Scene.syncMonsterFromServer(message);
		});
}

Engine.stop = function() {
	if(Socket !== null) {
		Socket.disconnect();
	}
	gameLoop.stop();
	unbindAllKeys();
	inGame = false;
}

Engine.isInGame = function() {
	return inGame;
}


//================
//PRIVATES METHODS
//================
var sendMessage = function(action,data) {
	data = data || {};
	data[Message['SESSION_ID']] = ServerConfig.custom['sessionId'];
	data[Message['DATE']] = new Date().getTime();
	data[Message['MESSAGE_POSITION']] = {
		x: currentAvatar ? currentAvatar.position.x : 0,
		y: currentAvatar ? currentAvatar.position.y : 0
	};
	// console.debug('Send Message : '+action)
	// console.debug(data);
	Socket.emit(action,data);
}

var sendSync = function() {
	var data = {};
	data[Message['MESSAGE_SAYING']] = currentAvatar.speaker.getText();
	sendMessage(Message['ACTION_SYNC'],data);
}

var showError = function(message) {
	alert(message);
}

var onLogged = function(messageRaw) {
	var message = JSON.parse(messageRaw);
	var avatars = message[Message['AVATARS']];
	for (var i = 0; i < avatars.length; i++) {
		if(avatars[i].id === ServerConfig.custom.avatarId) {
			var response = {};
			response[Message.MESSAGE_CHAR] = ServerConfig.custom.avatarId;
			sendMessage(Message['ACTION_CHOOSE_CHAR'],response);
			return;
		}
	}

	showError('Selected avatar is not bind to account');

}

var onJoinGame = function(messageRaw) {
	console.log('JOIN GAME');
	var message = JSON.parse(messageRaw);

	//1. create zone + create scene
	Scene.init(message);

	//2. create avatar
	currentAvatar = new Avatar(
		//id
		message[Message.MESSAGE_CHAR][Message.ID],
		//name
		message[Message.MESSAGE_CHAR][Message.NAME],
		//position
		new Vector(
			message[Message.MESSAGE_CHAR][Message.MESSAGE_POSITION].x,
			message[Message.MESSAGE_CHAR][Message.MESSAGE_POSITION].y
		),
		//size
		new Vector(
			message[Message.MESSAGE_CHAR][Message.MESSAGE_SIZE].x,
			message[Message.MESSAGE_CHAR][Message.MESSAGE_SIZE].y
		),
		//orientation
		message[Message.MESSAGE_CHAR][Message.MESSAGE_ANIMATION][Message.MESSAGE_DIRECTION],
		//mass
		message[Message.MESSAGE_CHAR][Message.MESSAGE_MASS],
		//move speed
		message[Message.MESSAGE_CHAR][Message.MESSAGE_MOVE_SPEED],
		//jump speed
		message[Message.MESSAGE_CHAR][Message.MESSAGE_JUMP_SPEED],
		//max hp
		message[Message.MESSAGE_CHAR][Message.MESSAGE_HP],
		//current hp
		message[Message.MESSAGE_CHAR][Message.MESSAGE_CURRENT_HP],
		//deltashow
		message[Message.MESSAGE_CHAR][Message.MESSAGE_DELTASHOW],
		//deltashow
		message[Message.MESSAGE_CHAR][Message.MESSAGE_SKIN],
		//remote
		false
	);

	currentAvatar.initSpeaker(true);

	currentAvatar.on('movementStop',function(mouvement){
		sendMessage(Message['ACTION_MOVE_STOP'], mouvement);

	})

	currentAvatar.speaker.on('textChange',function(txt){
		sendSync();
	}.bind(this));

	Scene.addAvatar(currentAvatar);

	bindGameKeys();


	gameLoop.start(updateTick);
	inGame = true;
	Scene.parseData(message[Message.ACTION_SYNC]);
}

var bindGameKeys = function(avatar) {
	KeyboardAdapter.addPushCallback(13 /* ENTER */,'speak', onEnterPushed);
	KeyboardAdapter.addPushCallback(32 /* SPACE */,'shoot', onSpacePushed);
	KeyboardAdapter.addPushCallback(37 /* LEFT */,'goLeft', onLeftPushed);
	KeyboardAdapter.addPushCallback(38 /* UP */,'jump', onUpPushed);
	KeyboardAdapter.addPushCallback(39 /* RIGHT */,'goRight', onRightPushed);
	KeyboardAdapter.addPushCallback(40 /* DOWN */,'goDown', onDownPushed);
	KeyboardAdapter.addReleaseCallback(37 /* LEFT */,'goLeftStop', onLeftReleased);
	KeyboardAdapter.addReleaseCallback(38 /* UP */,'jumpStop', onUpReleased);
	KeyboardAdapter.addReleaseCallback(39 /* RIGHT */,'goRightStop', onRightReleased);
	KeyboardAdapter.addReleaseCallback(40 /* DOWN */,'goDownStop', onDownReleased);
}

var unbindAllKeys = function(avatar) {
	KeyboardAdapter.releaseAllEvent();
}

var onLeftPushed = function() {
	var force = new UserMovement(
		new Vector(-currentAvatar.move_speed,0),
		Message['LEFT']
	);
	currentAvatar.addUserInputs(force);
	sendMessage(Message['ACTION_MOVE_START'],force);
	currentAvatar.oriented = 'left';
}

var onLeftReleased = function() {
	currentAvatar.removeUserInputs(Message['LEFT']);
}

var onUpPushed = function() {
	if(!currentAvatar.isLanded == false && currentAvatar.speaking == false) {
		// var force = new UserMovement(
		// 	new Vector(0,parseInt('-'+currentAvatar.jump_speed)),
		// 	Message['JUMP']
		// );
		// currentAvatar.addForceNextStep(force.movement) ;

		currentAvatar.velocity.y -= parseInt('-'+currentAvatar.jump_speed);
		sendMessage(Message['ACTION_JUMP'],{});

	}
}

var onUpReleased = function() {
	//stub
}

var onRightPushed = function() {
	var force = new UserMovement(
		new Vector(currentAvatar.move_speed,0),
		Message['RIGHT']
	);
	currentAvatar.addUserInputs(force);
	sendMessage(Message['ACTION_MOVE_START'],force);
	currentAvatar.oriented = 'right';
}

var onRightReleased = function() {
	currentAvatar.removeUserInputs(Message['RIGHT']);
}

var onDownPushed = function() {
	currentAvatar.goingDown = true;
	currentAvatar.unlanded();
	var data = {};
	data[Message['MESSAGE_POSITION']] = {
		'x' : currentAvatar.position.x,
		'y' : currentAvatar.position.y
	}
	sendMessage(Message['ACTION_GOING_DOWN'], data);
}

var onDownReleased = function() {
	currentAvatar.goingDown = false;
	var data = {};
	data[Message['MESSAGE_POSITION']] = {
		'x' : currentAvatar.position.x,
		'y' : currentAvatar.position.y
	}
	sendMessage(Message['ACTION_GOING_DOWN_STOP'], data);
}

var onEnterPushed = function() {
	currentAvatar.toggleSpeaking();
	if(currentAvatar.speaking === true) {
		KeyboardAdapter.sleepListeners();
	} else {
		KeyboardAdapter.wakeupListeners();
	}
}

var onSpacePushed = function() {
	console.log('shoot');
}

var updateTick = function() {
	var deltaTimeMs = new Date().getTime() - lastTimestampUpdate;
	FPS = 1000/deltaTimeMs;
	Scene.update(deltaTimeMs);
	lastTimestampUpdate = new Date().getTime();
}

var onConnectionReady = function(){
	console.log('Connection successfull');
	gameLoop = new Loop(parseInt(1000/ServerConfig.FPS)) ;

	sendMessage(Message['AUTH_BY_TOKEN'],{});
}

var onConnectionError = function(err){
	console.error('Connection error');
	console.error(err);
	//dont do this to keep reconnection working
	// Engine.stop();
}

module.exports = Engine;