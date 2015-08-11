var KeyboardAdapter = {};
// KeyboardAdapter.keys = {};
// KeyboardAdapter.keys.ENTER = 13;
// KeyboardAdapter.keys.SPACE = 32;
// KeyboardAdapter.keys.ARROW_LEFT = 37;
// KeyboardAdapter.keys.ARROW_RIGHT = 39;
// KeyboardAdapter.keys.ARROW_DOWN = 40;
// KeyboardAdapter.keys.ARROW_UP = 38;
// KeyboardAdapter.keys.n1 = 49;
// KeyboardAdapter.keys.n2 = 50;
// KeyboardAdapter.keys.n3 = 51;
// KeyboardAdapter.keys.n4 = 52;
// KeyboardAdapter.keys.n5 = 53;
// KeyboardAdapter.keys.X = 88;

var keyDownCallbacks = {};
var keyUpCallbacks = {};
var listenedKeys = {};
var keyIsDown = {};

// var addManagedKey = function(key) {
// 	listenedKeys[key] = true;
// }

// var removeManagedKey = function(key) {
// 	delete listenedKeys[key];
// }

KeyboardAdapter.addPushCallback = function(key, eventName, callback) {
	//add key to listened keys
	if(!listenedKeys[key]) {
		listenedKeys[key] = true;
	}
	//add callback to key
	if(!keyDownCallbacks[key]) {
		keyDownCallbacks[key] = {};
	}
	keyDownCallbacks[key][eventName] = callback;
}

KeyboardAdapter.addReleaseCallback = function(key, eventName, callback) {
	//add key to listened keys
	if(!listenedKeys[key]) {
		listenedKeys[key] = true;
	}
	//add callback to key
	if(!keyUpCallbacks[key]) {
		keyUpCallbacks[key] = {};
	}
	keyUpCallbacks[key][eventName] = callback;
}

KeyboardAdapter.removeCallback = function(key, eventName) {
	delete keyDownCallbacks[key][eventName];
	if(keyDownCallbacks[key].length === 0) {
		delete listenedKeys[key];
	}
}

var keyDown = function(e) {
	var evtobj = window.event? event : e;
	var key = evtobj.keyCode;
	if(key in listenedKeys){
		e.preventDefault();
		if(keyIsDown[key] === true) return;
		keyIsDown[key] = true;
		for(var keyCb in keyDownCallbacks[key]) {
			keyDownCallbacks[key][keyCb]();
		}
	}
}

var keyReleased = function(e) {
	var evtobj = window.event? event : e;
	var key = evtobj.keyCode;
	if(key in listenedKeys){
		if(keyIsDown[key] === false) return;
		e.preventDefault();
		keyIsDown[key] = false;
		for(var keyCb in keyUpCallbacks[key]) {
			keyUpCallbacks[key][keyCb]();
		}
	}
}

var releaseAllEvent = function() {
	delete document.onkeydown;
	delete document.onkeyup;
	keyDownCallbacks = {};
	keyUpCallbacks = {};
	listenedKeys = {};
	keyIsDown = {};
}


document.onkeydown  = keyDown;
document.onkeyup    = keyReleased;

module.exports = KeyboardAdapter;