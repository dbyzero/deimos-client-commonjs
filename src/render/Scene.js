var ServerConfig = require('../Config');
var Message = require('../Message')[ServerConfig.messageLevel];

var Avatar = require('../models/Element');

var Scene = {};
Scene.items			= {};
Scene.avatars		= {};
Scene.projectiles	= {};
Scene.attackZones	= {};
Scene.monsters		= {};
Scene.blocks		= {};
var dataToParse		= {};
var domElemScene	= null;

Scene.init = function(data){

	domElemScene = document.getElementById(ServerConfig.custom.domId);
	if(domElemScene === undefined || domElemScene === null) {
		throw new Error('Cannot find domElement');
	}

	Scene.name = data[Message['MESSAGE_GAME_AREA_NAME']]
	Scene.width = data[Message['MESSAGE_GAME_AREA_WIDTH']]
	Scene.height = data[Message['MESSAGE_GAME_AREA_HEIGHT']]
	Scene.blocks = data[Message['MESSAGE_GAME_AREA_BLOCKS']]

	//keep game datas in configuration
	ServerConfig.scene = this;

	renderCollistionArea();
}

Scene.parseData = function(data) {
	console.log(data);
	// parseData(data);
}

Scene.update = function(dt) {

	//update
	var keys,i;
	var now = new Date().getTime();

	keys = Object.keys(Scene.items);
	for(i=0;i<keys.length;i++) {
		Scene.items[keys[i]].update(dt,now);
	}
	keys = Object.keys(Scene.avatars);
	for(i=0;i<keys.length;i++) {
		Scene.avatars[keys[i]].update(dt,now);
	}
	keys = Object.keys(Scene.projectiles);
	for(i=0;i<keys.length;i++) {
		Scene.projectiles[keys[i]].update(dt,now);
	}
	keys = Object.keys(Scene.monsters);
	for(i=0;i<keys.length;i++) {
		Scene.monsters[keys[i]].update(dt,now);
	}
	keys = Object.keys(Scene.attackZones);
	for(i=0;i<keys.length;i++) {
		if(Scene.attackZones[keys[i]].update(dt,now) == false){
			Scene.attackZones[keys[i]].destroy();
			delete Scene.attackZones[keys[i]];
		};
	}

	//move and render entities !
	keys = Object.keys(Scene.avatars);
	for(i=0;i<keys.length;i++) {
		var avatar = Scene.avatars[keys[i]];
		avatar.move();
		avatar.updateAnimation();
	}
	//move and render Scene.projectiles !
	keys = Object.keys(Scene.projectiles);
	for(i=0;i<keys.length;i++) {
		Scene.projectiles[keys[i]].move();
	}
	//move and render entities !
	keys = Object.keys(Scene.items);
	for(i=0;i<keys.length;i++) {
		Scene.items[keys[i]].move();
	}
	//move and render Scene.monsters !
	keys = Object.keys(Scene.monsters);
	for(i=0;i<keys.length;i++) {
		var monster = Scene.monsters[keys[i]];
		monster.move();
		// monster.updateAnimation();
	}
}

Scene.addAvatar = function(avatar) {
	if(!avatar || !avatar.id) {
		throw new Error('Invalid avatar');
	}
	Scene.avatars[avatar.id] = avatar;
	domElemScene.appendChild(avatar.domElem)
}

var renderCollistionArea = function(blocks) {
	if(domElemScene === undefined || domElemScene === null) {
		throw new Error('Cannot find domElement');
	}

	for (var key = 0; key < Scene.blocks.length; key++) {
		//game stuff
		var block = Scene.blocks[key];

		//dom stuff
		var domBlock = document.createElement('div');
		domBlock.style.position = 'absolute';
		domBlock.style.backgroundColor = 'red';
		domBlock.style.width = block.width+'px';
		domBlock.style.height = block.height+'px';
		domBlock.style.left = block.position.x+'px';
		domBlock.style.top = block.position.y+'px';
		domBlock.style.backgroundColor = 'rgb(186, 186, 186)';
		domElemScene.appendChild(domBlock);
	};
}

module.exports = Scene;