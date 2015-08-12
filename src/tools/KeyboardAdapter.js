var KeyboardAdapter = {};

/**

REMINDER :

n1 = 49
n2 = 50
n3 = 51
n4 = 52
n5 = 53
X = 88
ENTER = 13
SPACE = 32
ARROW_LEFT = 37
ARROW_RIGHT = 39
ARROW_DOWN = 40
ARROW_UP = 38

*/

var keyDownCallbacks = {};
var keyUpCallbacks = {};
var listenedKeys = {};
var keyIsDown = {};

var isSleeping = false;

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

KeyboardAdapter.sleepListeners = function() {
	isSleeping = true;
}

KeyboardAdapter.wakeupListeners = function() {
	isSleeping = false;
}

var keyDown = function(e) {
	var evtobj = window.event? event : e;

	//We keep listener ENTER (touch toggeling speaker mode)
	if(evtobj.keyCode !== 13 && isSleeping === true) return;

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

	//We keep listener ENTER (touch toggeling speaker mode)
	if(evtobj.keyCode !== 13 && isSleeping === true) return;

	var key = evtobj.keyCode;
	if(key in listenedKeys){
		e.preventDefault();
		if(keyIsDown[key] === false) return;
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